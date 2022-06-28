"use strict";

const {
  docClient,
  refreshTokens,
  gmailAxios,
  setAccessToken,
  s3,
} = require("./lib");
const { client_id, client_secret } = require("./config");
const { v4 } = require("uuid");
const { toUTC, toLocalTime } = require("../../shared/toUTC");

const getParsedGmailMessage = async (data) => {
  console.log("getParsedGmailMessage");
  const message = Object.assign({}, data);
  const { id: messageId, payload } = message;

  const getParsedMessageParts = async (messagePart) => {
    console.log("getParsedMessageParts");
    const { partId, mimeType, filename, body, parts: subParts } = messagePart;
    if (subParts && subParts.length)
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
        .catch((err) => console.log(err));

      const fileId = messageId + filename,
        fileName = `${messageId}/${filename}`,
        fid = fileId
          .replace(/\s/g, "")
          .replace(/[^a-zA-Z.0-9]+|\.(?=.*\.)/g, "")
          .replace(/\.[^/.]+$/, "")
          .toLowerCase();

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

      console.log("saveAttachmentsToDatabase");
      console.log("Params:", saveAttachmentsParams);

      const saveAttachments = await docClient
        .put({
          TableName: "GmailMessageAttachment",
          Item: saveAttachmentsParams,
        })
        .promise();
      console.log("Response:", saveAttachments);

      console.log("saveAttachmentsToS3");
      const saveAttachmentsToS3 = {
        ContentType: mimeType,
        Bucket: process.env.REACT_APP_S3_GMAIL_ATTACHMENT_BUCKET,
        Key: fileName,
        Body: Buffer.from(data, "base64"),
      };

      console.log("Params:", saveAttachmentsToS3);
      const s3Response = await s3.putObject(saveAttachmentsToS3).promise();

      console.log("Response:", s3Response);

      _parsedMessagePart["path"] = fileName;
    }

    return _parsedMessagePart;
  };

  const parsedMessageParts = [];
  const parts = await getParsedMessageParts(payload);

  const formatParts = (parts) => {
    for (const part of parts) {
      if (Array.isArray(part)) formatParts(part);
      else parsedMessageParts.push(part);
    }
  };

  formatParts(parts);

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

  return {
    ...message,
    ...headerInfo,
    payload: {
      ...payload,
      parsedParts: parsedMessageParts,
    },
  };
};

const checkGmailMessages = async (
  email,
  startHistoryId,
  companyId,
  pageToken
) => {
  console.log(
    "checkGmailMessages:",
    email,
    startHistoryId,
    companyId,
    pageToken
  );
  const {
    data: { history, historyId, nextPageToken },
  } = await gmailAxios
    .get(`/gmail/v1/users/me/history`, {
      params: { startHistoryId, pageToken },
    })
    .catch((err) => console.log(err));

  if (history) {
    for (const {
      /* id, messages,  */ messagesAdded,
      messagesDeleted /* labelsAdded, labelsRemoved */,
    } of history) {
      if (messagesAdded) {
        const messages = await Promise.all(
          messagesAdded.map(
            ({ message: { id } }) =>
              new Promise((resolve, reject) => {
                gmailAxios
                  .get(`/gmail/v1/users/me/messages/${id}`)
                  .then((response) => resolve(response.data))
                  .catch(reject);
              })
          )
        );

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
                      payload: Item.payload,
                      updatedAt: toUTC(new Date()),
                    },
                  },
                })),
              },
            })
            .promise();

          console.log("saveEmails:", saveEmails);

          const saveCompanyEmails = await docClient
            .batchWrite({
              RequestItems: {
                CompanyGmailMessageTable: messagesToAdd.map((Item) => ({
                  PutRequest: {
                    Item: {
                      id: v4(),
                      gmailMessageId: Item.id,
                      companyId: companyId,
                      isDeleted: false,
                      isSaved: false,
                      createdAt: toUTC(new Date()),
                    },
                  },
                })),
              },
            })
            .promise();

          console.log("saveCompanyEmails:", saveCompanyEmails);
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

  console.log("pushSubscriptionHandler");

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

    const {
      refreshToken: refreshToken,
      historyId: oldHistoryId,
      companyId: companyId,
    } = gmailToken;

    console.log("gmailToken:",gmailToken);

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
      .put({ TableName: "GmailTokenTable", Item: { ...gmailToken, historyId } })
      .promise();

    responseBody = JSON.stringify({
      success: true,
      message: "message data is accepted.",
    });
    return true;
  } catch ({ message }) {
    console.log("errMessage: ", message);
  }
};

module.exports = { pushSubscriptionHandler, getParsedGmailMessage };
