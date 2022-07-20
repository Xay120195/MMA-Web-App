"use strict";

const {
  docClient,
  refreshTokens,
  gmailAxios,
  setAccessToken,
  s3,
} = require("../../../services/gmail/lib");
const {
  client_id,
  client_secret,
  project_id,
} = require("../../../services/gmail/config");
const { toUTC, toLocalTime } = require("../../../shared/toUTC");
exports.handler = async () => {
  console.log("Event Bridge: Gmail Re-Subscription");
  let responseBody = "";

  try {
    const { Items } = await docClient
      .scan({ TableName: "GmailTokenTable" })
      .promise();

    console.log("Get GmailTokenTable", Items);

    await Promise.all(
      Items.map(
        (item) =>
          new Promise(async (resolve, reject) => {
            try {
              const { expiration, id, refreshToken } = item;

              if (new Date().getTime() < +expiration - 864000000) resolve();

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

              const endpoint = `/gmail/v1/users/${id}/watch`,
                topic = `projects/${project_id}/topics/${process.env.REACT_APP_GMAIL_TOPIC}`;

              console.log("endpoint:", endpoint);
              console.log("topic:", topic);

              const { data: watchData } = await gmailAxios
                .post(endpoint, {
                  topicName: topic,
                  labelIds: ["INBOX"]
                })
                .catch((err) => console.log(err));

              console.log("watch data:", watchData);

              const items = {
                ...item,
                ...watchData,
                updatedAt: toUTC(new Date()),
              };

              // console.log("Save to GmailTokenTable:", items);
              await docClient
                .put({
                  TableName: "GmailTokenTable",
                  Item: items,
                })
                .promise();

              resolve();
            } catch (error) {
              console.log("error: ", error);
              reject(error);
            }
          })
      )
    );

    responseBody = JSON.stringify({
      success: true,
      message: "subscriptions are re-watched.",
    });
  } catch ({ message }) {
    console.log("errMessage: ", message);

    responseBody = JSON.stringify({ success: false, message });
  } finally {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: responseBody,
    };
  }
};
