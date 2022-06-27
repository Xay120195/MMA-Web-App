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
const getOldMessages = async (email, companyId, pageToken) => {
  console.log("getOldMessages");
  const {
    data: { messages: messageIds, nextPageToken },
  } = await gmailAxios.get(`/gmail/v1/users/${email}/messages`, {
    params: {
      maxResults: 25,
      q: "label:inbox after:2022/06/01", // all inbox from June 2022
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

  console.log("message count: ", messages.length);

  const messagesToAdd = await Promise.all(messages.map(getParsedGmailMessage));
  // console.log("messagesToAdd: ", messagesToAdd);

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

  const filterMessagesIDs = messagesToAdd.map((Item) => Item.id);

  var params = {
    TableName: "CompanyGmailMessageTable",
    IndexName: "byCompany",
    KeyConditionExpression: "#companyId = :companyId", // this equals "type = hat"
    ExpressionAttributeNames: { "#companyId": "companyId" },
    ExpressionAttributeValues: { ":companyId": companyId },
  };

  const getExistingGmailMessages = await docClient.query(params).promise();

  const existingGmailMessages = getExistingGmailMessages.Items.map(
    (Item) => Item.gmailMessageId
  );

  const nonExistingGmailMessages = filterMessagesIDs.filter(
    (f) => !existingGmailMessages.includes(f)
  );

  if (nonExistingGmailMessages.length != 0) {
    const saveCompanyEmails = await docClient
      .batchWrite({
        RequestItems: {
          CompanyGmailMessageTable: nonExistingGmailMessages.map((i) => ({
            PutRequest: {
              Item: {
                id: v4(),
                gmailMessageId: i,
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

  if (nextPageToken) await getOldMessages(email, companyId, nextPageToken);
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

    await getOldMessages(email, payload.companyId);

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
