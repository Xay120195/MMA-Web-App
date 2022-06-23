const {
  docClient,
  refreshTokens,
  setAccessToken,
  gmailAxios,
} = require("./lib");
const { client_id, client_secret, project_id } = require("./config");
const { getParsedGmailMessage } = require("./pushSubscription");
const { toUTC, toLocalTime } = require("../../shared/toUTC");
const { v4 } = require("uuid");
const getOldMessages = async (email, pageToken) => {
  console.log("getOldMessages", email);
  const {
    data: { messages: messageIds, nextPageToken },
  } = await gmailAxios.get(`/gmail/v1/users/${email}/messages`, {
    params: {
      maxResults: 25,
      ...(pageToken ? { pageToken } : {}),
    },
  });

  // console.log("messages", messageIds);

  const messages = await Promise.all(
    messageIds.map(
      ({ id }) =>
        new Promise((resolve, reject) => {
          gmailAxios
            .get(`/gmail/v1/users/me/messages/${id}`)
            .then((response) => resolve(response.data))
            .catch(reject);
        })
    )
  );

  console.log("messages", messages.length);

  const messagesToAdd = await Promise.all(messages.map(getParsedGmailMessage));
  console.log("messagesToAdd: ", messagesToAdd);

  await docClient
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

  if (nextPageToken) await getOldMessages(email, nextPageToken);
};

exports.addToken = async (ctx) => {
  let responseBody = "";

  try {
    const payload = ctx;

    const { email, refreshToken } = ctx;

    const {
      data: { access_token },
    } = await refreshTokens({
      refresh_token: refreshToken,
      client_id,
      client_secret,
    });

    if (!access_token) throw new Error("can't refresh tokens.");

    console.log("access_token:", access_token);
    setAccessToken(access_token);

    const { data: watchData } = await gmailAxios.post(
      `/gmail/v1/users/${email}/watch`,
      { topicName: `projects/${project_id}/topics/gmail-api` }
    );

    console.log("watchData:", watchData);
    delete payload.email;

    const items = {
      id: email,
      ...payload,
      ...watchData,
      updatedAt: toUTC(new Date()),
    };

    console.log("items:", items);
    const request = await docClient
      .put({
        TableName: "GmailTokenTable",
        Item: items,
      })
      .promise();

    console.log("request:", request);
    await getOldMessages(email);

    const response = {
      email: items.id,
      refreshToken: items.refreshToken,
      userId: items.userId,
      companyId: items.companyId,
      updatedAt: items.updatedAt,
    };

    return response;
  } catch ({ message }) {
    console.log("errMessage: ", message);
  }
};
