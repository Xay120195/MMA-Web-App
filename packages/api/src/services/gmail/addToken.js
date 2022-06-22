const {
  docClient,
  refreshTokens,
  setAccessToken,
  gmailAxios,
} = require("./lib");
const { client_id, client_secret, project_id } = require("./config");
const { getParsedGmailMessage } = require("./pushSubscription");

const getOldMessages = async (email, pageToken) => {
  const {
    data: { messages: messageIds, nextPageToken },
  } = await gmailAxios.get(`/gmail/v1/users/${email}/messages`, {
    params: {
      maxResults: 500,
      ...(pageToken ? { pageToken } : {}),
    },
  });

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

  const messagesToAdd = await Promise.all(messages.map(getParsedGmailMessage));
  console.log("messagesToAdd: ", messagesToAdd);

  await docClient
    .batchWrite({
      RequestItems: {
        GmailMessageTable: messagesToAdd.map((Item) => ({
          PutRequest: { Item: { connectedEmail: email, ...Item } },
        })),
      },
    })
    .promise();

  if (nextPageToken) await getOldMessages(email, nextPageToken);
};

exports.addToken = async (ctx) => {
  let responseBody = "";

  try {
    const payload = ctx.arguments;

    console.log("addToken arguments:",ctx);

    const { email, refreshToken } = ctx.arguments;

    const { data: {access_token} } = await refreshTokens({
      refresh_token: refreshToken,
      client_id,
      client_secret,
    });


    console.log("access_token", access_token);

    if (!access_token) throw new Error("can't refresh tokens.");

    setAccessToken(access_token);

    const { data: watchData } = await gmailAxios.post(
      `/gmail/v1/users/${email}/watch`,
      { topicName: `projects/${project_id}/topics/gmail-api` }
    );

    await docClient
      .put({
        TableName: "GmailTokenTable",
        Item: {
          ...payload,
          ...watchData,
          updatedAt: toUTC(new Date()),
        },
      })
      .promise();

    await getOldMessages(email);

    return rawParams;
  } catch ({ message }) {
    console.log("errMessage: ", message);
  }
};