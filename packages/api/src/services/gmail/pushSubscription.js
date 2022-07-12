"use strict";

const {
  docClient,
  refreshTokens,
  gmailAxios,
  setAccessToken,
  s3,
} = require("./lib");
const { client_id, client_secret } = require("./config");
const { toUTC } = require("../../shared/toUTC");
// const { v4 } = require("uuid");
const isArray = function (a) {
  return Array.isArray(a);
};

const isObject = function (o) {
  return o === Object(o) && !isArray(o) && typeof o !== "function";
};

function isIterable(variable) {
  return isArray(variable) || isObject(variable);
}

const getParsedGmailMessage = async (data) => {
  const message = Object.assign({}, data);
  const { id: messageId, payload } = message;

  console.log("getParsedGmailMessage()", message);

  const getParsedMessageParts = async (messagePart) => {
    console.log("getParsedMessageParts()", messagePart);
    const { partId, mimeType, filename, body, parts: subParts } = messagePart;
    console.log("subParts", subParts);

    if (subParts !== undefined)
      return await Promise.all(subParts.map(getParsedMessageParts));

    const _parsedMessagePart = {
      id: partId,
      mimeType,
    };

    if (mimeType.startsWith("text") && body.data) {
      _parsedMessagePart["content"] = Buffer.from(body.data, "base64").toString(
        "utf-8"
      );
    }

    if (filename) {
      console.log("Has Attachment:", filename);
      _parsedMessagePart["filename"] = filename;

      const getAttachmentByMessage = `/gmail/v1/users/me/messages/${messageId}/attachments/${body.attachmentId}`;
      const {
        data: { data },
      } = await gmailAxios
        .get(getAttachmentByMessage)
        .catch(({ message }) =>
          console.log("getAttachmentByMessage Error:", message)
        );

      let trimName = filename;
      trimName = trimName
        .replace(/[^a-zA-Z.0-9]+|\.(?=.*\.)/g, "")
        .replace(/\s/g, "")
        .replace(/\.[^/.]+$/, "")
        .toLowerCase();
      if (trimName.length > 40) trimName = trimName.substring(0, 40);

      const fid = messageId + trimName,
        fileName = `${messageId}/${filename}`;

      const { Item: getExistingAttachments } = await docClient
        .get({ TableName: "GmailMessageAttachment", Key: { id: fid } })
        .promise();

      console.log("getExistingAttachments:", getExistingAttachments);
      if (getExistingAttachments === undefined) {
        console.log("Save Attachments To Database:", filename);
        try {
          const saveAttachmentsParams = {
            id: fid,
            messageId: messageId,
            s3ObjectKey: fileName,
            size: body.size,
            type: mimeType,
            name: filename,
            details: "",
            updatedAt: toUTC(new Date()),
          };
          console.log("Params:", saveAttachmentsParams);

          const saveAttachments = await docClient
            .put({
              TableName: "GmailMessageAttachment",
              Item: saveAttachmentsParams,
            })
            .promise();
          console.log("Response:", filename, saveAttachments);
        } catch (message) {
          console.log("docClient.put Failed:", filename, message);
        }

        console.log("Upload Attachments To S3:", fileName);
        try {
          const saveAttachmentsToS3 = {
            ContentType: mimeType,
            Bucket: process.env.REACT_APP_S3_GMAIL_ATTACHMENT_BUCKET,
            Key: `public/${fileName}`,
            Body: Buffer.from(data, "base64"),
          };

          console.log("Params:", saveAttachmentsToS3);
          const s3Response = await s3.putObject(saveAttachmentsToS3).promise();
          console.log("Response:", fileName, s3Response);
        } catch (message) {
          console.log("s3.putObject Failed:", filename, message);
        }
      }

      _parsedMessagePart["path"] = fileName;
    }

    return _parsedMessagePart;
  };

  const parsedMessageParts = [];
  const parts = await getParsedMessageParts(payload);

  const formatParts = (parts) => {
    if (parts !== undefined && isIterable(parts) && parts.length > 0) {
      for (const part of parts) {
        if (Array.isArray(part)) {
          formatParts(part);
        } else {
          parsedMessageParts.push(part);
        }
      }
    }
  };

  if (isIterable(parts)) {
    formatParts(parts);
  }

  const headerInfo = {};

  for (const { name, value } of payload.headers) {
    const key = (name.charAt(0).toLowerCase() + name.slice(1))
      .replace(/-/g, "")
      .replace(/ /g, "");

    headerInfo[key] = value;
  }

  if (headerInfo["subject"])
    headerInfo["lower_subject"] = headerInfo["subject"].toLowerCase();

  if (headerInfo["deliveredTo"])
    headerInfo["recipient"] = headerInfo["deliveredTo"].toLowerCase();

  if (headerInfo["date"])
    headerInfo["receivedAt"] = new Date(headerInfo["date"]).getTime();

  if (message["snippet"])
    message["lower_snippet"] = message["snippet"].toLowerCase();

  const initPL = {
    ...payload,
    parsedParts: parsedMessageParts,
  };
  // chunk by 174K characters
  const chunkedPL = chunkSubstr(JSON.stringify(initPL), 174000);

  const savePayload = await docClient
    .batchWrite({
      RequestItems: {
        GmailPayloadTable: chunkedPL.map((Item, index) => ({
          PutRequest: {
            Item: {
              id: `${message.id}-part-${index + 1}`,
              messageId: message.id,
              content: Item,
              order: index + 1,
            },
          },
        })),
      },
    })
    .promise();

  return {
    ...message,
    ...headerInfo,
  };
};

function chunkSubstr(str, size) {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
}

const checkGmailMessages = async (
  email,
  startHistoryId,
  companyId,
  pageToken
) => {
  console.log("checkGmailMessages()");
  console.log("Get History:", email, startHistoryId, companyId, pageToken);
  const {
    data: { history, historyId, nextPageToken },
  } = await gmailAxios
    .get(`/gmail/v1/users/${email}/history`, {
      params: { startHistoryId, pageToken, labelId: "INBOX" },
    })
    .catch((message) =>
      console.log(`Error: /gmail/v1/users/${email}/history`, message)
    );

  if (history) {
    for (const {
      /* id, messages,  */ messagesAdded,
      messagesDeleted /* labelsAdded, labelsRemoved */,
    } of history) {
      if (messagesAdded) {
        console.log("messagesAdded", JSON.stringify(messagesAdded));
        const messages = await Promise.all(
          messagesAdded.map(
            ({ message: { id } }) =>
              new Promise((resolve, reject) => {
                const reqMessages = `/gmail/v1/users/${email}/messages/${id}`;

                console.log("Request: ", reqMessages);
                gmailAxios
                  .get(reqMessages)
                  .then((response) => {
                    console.log("Success Response:", response);
                    resolve(response.data);
                  })
                  .catch((error) => {
                    console.log("Error Response:", error);
                    reject(error);
                  });
              })
          )
        );

        console.log(messages);

        if (messages.length != 0) {
          const messagesToAdd = await Promise.all(
            messages.map(getParsedGmailMessage)
          );

          const saveEmails = await docClient
            .batchWrite({
              RequestItems: {
                GmailMessageTable: messagesToAdd.map((Item) => ({
                  PutRequest: {
                    Item: {
                      id: Item.id,
                      threadId: Item.threadId,
                      connectedEmail: email,
                      messageId: Item.messageID,
                      contentType: Item.contentType,
                      date: Item.date,
                      internalDate: Item.internalDate,
                      receivedAt: Item.receivedAt,
                      from: Item.from,
                      to: Item.to,
                      recipient: Item.recipient,
                      cc: Item.cc,
                      bcc: Item.bcc,
                      historyId: Item.historyId,
                      subject: Item.subject,
                      lowerSubject: Item.lower_subject,
                      snippet: Item.snippet,
                      lowerSnippet: Item.lower_snippet,
                      labels: Item.labelIds,
                      // payload: Item.payload,
                      updatedAt: toUTC(new Date()),
                    },
                  },
                })),
              },
            })
            .promise();

          console.log("Save to GmailMessageTable:", saveEmails);

          const filterMessagesIDs = messagesToAdd.map((Item) => {
            return {
              id: Item.id,
              dateReceived: Item.receivedAt,
              recipient: Item.recipient,
              subject: Item.lower_subject,
              snippet: Item.lower_snippet,
            };
          });

          var params = {
            TableName: "CompanyGmailMessageTable",
            IndexName: "byCompany",
            KeyConditionExpression: "#companyId = :companyId",
            ExpressionAttributeNames: { "#companyId": "companyId" },
            ExpressionAttributeValues: { ":companyId": companyId },
          };

          console.log("Get Existing Gmail Messages by Company:", params);

          const getExistingGmailMessages = await docClient
            .query(params)
            .promise();

          const existingGmailMessages = getExistingGmailMessages.Items.map(
            (Item) => Item.gmailMessageId
          );
          console.log("Existing Gmail Messages", existingGmailMessages);

          const nonExistingGmailMessages = filterMessagesIDs.filter(
            (f) => !existingGmailMessages.includes(f.id)
          );

          console.log("Non-Existing Gmail Messages", nonExistingGmailMessages);

          if (nonExistingGmailMessages.length != 0) {
            try {
              const saveCompanyEmails = await docClient
                .batchWrite({
                  RequestItems: {
                    CompanyGmailMessageTable: nonExistingGmailMessages.map(
                      (i) => ({
                        PutRequest: {
                          Item: {
                            id: `${companyId}-${i.id}`,
                            gmailMessageId: i.id,
                            companyId: companyId,
                            isDeleted: false,
                            isSaved: false,
                            createdAt: toUTC(new Date()),
                            dateReceived: i.dateReceived.toString(),
                            filters: `${email}#${i.subject}#${i.snippet}`,
                          },
                        },
                      })
                    ),
                  },
                })
                .promise();
              console.log(
                "Save to CompanyGmailMessageTable:",
                saveCompanyEmails
              );
            } catch ({ message }) {
              console.log("Error in Saving CompanyGmailMessageTable", message);
            }
          }
        }
      }

      if (messagesDeleted) {
        await docClient
          .batchWrite({
            RequestItems: {
              GmailMessageTable: messagesDeleted.map(({ message: { id } }) => ({
                DeleteRequest: { Key: { id } },
              })),
            },
          })
          .promise();
      }
    }
  }

  if (nextPageToken)
    await checkGmailMessages(email, startHistoryId, companyId, nextPageToken);
};

const pushSubscriptionHandler = async (event) => {
  let responseBody = "";

  console.log("pushSubscriptionHandler()");

  try {
    const payload = JSON.parse(event.body);
    console.log("payload: ", payload);

    const { emailAddress: email, historyId } = JSON.parse(
      Buffer.from(payload.message.data, "base64").toString("utf-8")
    );

    console.log("emailAddress:", email);
    const { Item: gmailToken } = await docClient
      .get({ TableName: "GmailTokenTable", Key: { id: email } })
      .promise();

    if (gmailToken !== undefined) {
      const {
        refreshToken: refreshToken,
        historyId: oldHistoryId,
        companyId: companyId,
      } = gmailToken;

      console.log("gmailToken:", gmailToken);

      const {
        data: { access_token },
      } = await refreshTokens({
        refresh_token: refreshToken,
        client_id,
        client_secret,
      });

      setAccessToken(access_token);

      console.log("access_token:", access_token);

      await checkGmailMessages(email, oldHistoryId, companyId);

      await docClient
        .put({
          TableName: "GmailTokenTable",
          Item: { ...gmailToken, historyId },
        })
        .promise();

      responseBody = JSON.stringify({
        success: true,
        message: "message data is accepted.",
      });
    } else {
      console.log(`${email} is disconnected. Stopping...`);
      let stop = `/gmail/v1/users/${email}/stop`;

      gmailAxios
        .post(stop)
        .then((response) => {
          console.log("Stopping response: ", response);
        })
        .catch((message) => {
          console.log(message.response.data.error);
        });
    }

    return true;
  } catch (message) {
    console.log("pushSubscriptionHandler errMessage: ", message);
    console.log(message.response.data.error);
  }
};

module.exports = { pushSubscriptionHandler, getParsedGmailMessage };
