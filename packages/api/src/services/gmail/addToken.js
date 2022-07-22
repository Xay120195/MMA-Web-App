const {
  docClient,
  refreshTokens,
  setAccessToken,
  gmailAxios,
} = require("./lib");
const { client_id, client_secret, project_id } = require("./config");
const { getParsedGmailMessage } = require("./pushSubscription");
const { toUTC } = require("../../shared/toUTC");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const ddbClient = require("../../lib/dynamodb-client");
const { QueryCommand } = require("@aws-sdk/client-dynamodb");
var momentTZ = require("moment-timezone");

const getEmailStartDate = async (email, inputTZ) => {
  console.log("Connected Email:", email);
  console.log("Timezone:", inputTZ);

  // check if already connected before
  // get the last email fetched
  const gmailParam = {
    TableName: "GmailMessageTable",
    IndexName: "byConnectedEmail",
    KeyConditionExpression: "connectedEmail = :connectedEmail",
    ExpressionAttributeValues: marshall({
      ":connectedEmail": email,
    }),
    ScanIndexForward: false,

    Limit: 1,
  };

  const gmailCmd = new QueryCommand(gmailParam);
  const gmailResult = await ddbClient.send(gmailCmd);
  const parseGmailResponse = gmailResult.Items.map((data) => unmarshall(data));

  let input;
  if (parseGmailResponse.length != 0) {
    const lastEmailReceived = parseGmailResponse[0].date;
    console.log("Previously Connected last:", lastEmailReceived);
    input = momentTZ(lastEmailReceived).tz(inputTZ);
  } else {
    input = momentTZ().tz(inputTZ);
  }

  console.log("Current Date: ", input);

  const getDate = momentTZ(input, inputTZ).format("YYYY-MM-DD");
  const getTZ = momentTZ(input, inputTZ).format("Z");
  const midnightDate = `${getDate}T00:00:00${getTZ}`;
  console.log("Current Date (Midnight): ", midnightDate);
  console.log(
    "Formatted Current Date: ",
    momentTZ(new Date(midnightDate)).tz(inputTZ).format("LLLL")
  );
  const unix = momentTZ(new Date(midnightDate)).tz(inputTZ).unix();
  console.log("Current Date (Unix):", unix);
  return unix;
};

const getOldMessages = async (email, companyId, rangeFilter, pageToken) => {
  console.log("getOldMessages()");

  const getMessagesByEmail = `/gmail/v1/users/${email}/messages`;
  const getMessagesByEmailParams = {
    maxResults: 25,
    q: ("label:inbox " + rangeFilter).trim(),
    ...(pageToken ? { pageToken } : {}),
  };

  const {
    data: { messages: messageIds, nextPageToken },
  } = await gmailAxios
    .get(getMessagesByEmail, {
      params: getMessagesByEmailParams,
    })
    .catch(({ err }) => console.log("Error in getMessagesByEmail", err));

  // console.log("Request:", getMessagesByEmail);
  // console.log("Params:", getMessagesByEmailParams);
  // console.log("Result messageIds:", messageIds);

  if (messageIds != undefined && messageIds.length != 0) {
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

    const messagesToAdd = await Promise.all(
      messages.map(getParsedGmailMessage)
    );
    // console.log("Retrieved Messages: ", messagesToAdd);

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

    // console.log("Save to GmailMessageTable:", saveEmails);

    const filterMessagesIDs = messagesToAdd.map((Item) => {
      return {
        id: Item.id,
        dateReceived: Item.receivedAt,
        recipient: Item.recipient,
        subject: Item.lower_subject,
        snippet: Item.lower_snippet,
        from: Item.from,
        to: Item.to,
      };
    });

    var params = {
      TableName: "CompanyGmailMessageTable",
      IndexName: "byCompany",
      KeyConditionExpression: "#companyId = :companyId",
      ExpressionAttributeNames: { "#companyId": "companyId" },
      ExpressionAttributeValues: { ":companyId": companyId },
    };

    // console.log("Get Existing Gmail Messages by Company:", params);

    const getExistingGmailMessages = await docClient.query(params).promise();

    const existingGmailMessages = getExistingGmailMessages.Items.map(
      (Item) => Item.gmailMessageId
    );
    // console.log("Existing Gmail Messages", existingGmailMessages);

    const nonExistingGmailMessages = filterMessagesIDs.filter(
      (f) => !existingGmailMessages.includes(f.id)
    );

    // console.log("Non-Existing Gmail Messages", nonExistingGmailMessages);

    if (nonExistingGmailMessages.length != 0) {
      const saveCompanyEmails = await docClient
        .batchWrite({
          RequestItems: {
            CompanyGmailMessageTable: nonExistingGmailMessages.map((i) => ({
              PutRequest: {
                Item: {
                  id: `${companyId}-${i.id}`,
                  gmailMessageId: i.id,
                  companyId: companyId,
                  isDeleted: false,
                  isSaved: false,
                  createdAt: toUTC(new Date()),
                  dateReceived: i.dateReceived.toString(),
                  filters: `${i.recipient}#${extractEmails(i.from).join(',')}#${extractEmails(i.to).join(',')}#${i.subject}#${i.snippet}`,
                },
              },
            })),
          },
        })
        .promise();

      // console.log("Save to CompanyGmailMessage Table:", saveCompanyEmails);
    }
  }
  if (nextPageToken)
    await getOldMessages(email, companyId, rangeFilter, nextPageToken);
};

const extractEmails = (text) => {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
};

exports.addToken = async (ctx) => {
  let responseBody = "";

  try {
    const payload = ctx;
    // console.log("addToken Context: ", ctx);
    const { email, refreshToken, userTimeZone = "Australia/Sydney" } = ctx;

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

    const endpoint = `/gmail/v1/users/${email}/watch`,
      topic = `projects/${project_id}/topics/${process.env.REACT_APP_GMAIL_TOPIC}`;

    console.log("endpoint:", endpoint);
    console.log("topic:", topic);

    const { data: watchData } = await gmailAxios
      .post(endpoint, {
        topicName: topic,
        labelIds: ["INBOX"],
      })
      .catch((message) => {
        let err = message.response.data.error,
          gmailWatchError =
            "Only one user push notification client allowed per developer (call /stop then try again)";
        console.log("Error in fetching history ID:", err);

        if (err.message == gmailWatchError) {
          let stop = `/gmail/v1/users/${email}/stop`;
          console.log("Call STOP watch endpoint");

          const stopWatch = gmailAxios
            .post(stop)
            .then((response) => {
              console.log(response);
              console.log("Call Add Token again");
              addToken(ctx);
            })
            .catch((message) => {
              console.log(message);
            });
        }
      });

    console.log("watchData:", watchData);
    delete payload.email;

    const items = {
      id: email,
      ...payload,
      ...watchData,
      updatedAt: toUTC(new Date()),
    };

    try {
      // console.log("Save to GmailTokenTable:", items);
      const request = await docClient
        .put({
          TableName: "GmailTokenTable",
          Item: items,
        })
        .promise();
      // console.log("Response:", request);
    } catch ({ message }) {
      console.log("docClient.put Failed:", message);
    }

    const rangeFilter =
      "after:" + (await getEmailStartDate(email, userTimeZone));
    console.log("rangeFilter:", rangeFilter);

    await getOldMessages(email, payload.companyId, rangeFilter);

    const response = {
      id: items.id,
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
