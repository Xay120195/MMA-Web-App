"use strict";

const {
  docClient,
  refreshTokens,
  gmailAxios,
  setAccessToken,
  s3,
} = require("./lib");
const { client_id, client_secret } = require("./config");

exports.getParsedGmailMessage = async (data) => {
  const message = Object.assign({}, data);
  const { id: messageId, payload } = message;

  const getParsedMessageParts = async (messagePart) => {
    const { partId, mimeType, filename, body, parts: subParts } = messagePart;
    if (subParts.length)
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
      _parsedMessagePart["filename"] = filename;
      const {
        data: { data },
      } = await gmailAxios.get(
        `/gmail/v1/users/me/messages/${messageId}/attachments/${body.attachmentId}`
      );

      const fileName = `${messageId}/${filename}`;
      const s3Response = await s3
        .putObject({
          ContentType: mimeType,
          Bucket: "gmail-attachments",
          Key: fileName,
          Body: Buffer.from(data, "base64"),
        })
        .promise();

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
      .replaceAll("-", "")
      .replaceAll(" ", "");
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

const checkGmailMessages = async (email, startHistoryId, pageToken) => {
  const {
    data: { history, historyId, nextPageToken },
  } = await gmailAxios.get(`/gmail/v1/users/me/history`, {
    params: { startHistoryId, pageToken },
  });

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

        const messagesToAdd = await Promise.all(
          messages.map(getParsedGmailMessage)
        );

        await docClient
          .batchWrite({
            RequestItems: {
              gmailMessages: messagesToAdd.map((Item) => ({
                PutRequest: { Item: { connectedEmail: email, ...Item } },
              })),
            },
          })
          .promise();
      }

      if (messagesDeleted) {
        await docClient
          .batchWrite({
            RequestItems: {
              gmailMessages: messagesDeleted.map(({ message: { id } }) => ({
                DeleteRequest: { Key: { id } },
              })),
            },
          })
          .promise();
      }
    }
  }

  if (nextPageToken)
    await checkGmailMessages(email, startHistoryId, nextPageToken);
};

exports.pushSubscriptionHandler = async (ctx) => {
  let responseBody = "";

  try {
    const { email, historyId } = ctx.arguments;

    const { Item: gmailToken } = await docClient
      .get({ TableName: "GmailTokenTable", Key: { email } })
      .promise();
    const { refresh_token, historyId: oldHistoryId } = gmailToken;

    const {
      data: { access_token },
    } = await refreshTokens({
      refresh_token: refresh_token,
      client_id,
      client_secret,
    });

    setAccessToken(access_token);

    await checkGmailMessages(email, oldHistoryId);

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

// module.exports = { handler: pushSubscriptionHandler, getParsedGmailMessage };
