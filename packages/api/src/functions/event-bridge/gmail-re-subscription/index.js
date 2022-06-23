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

exports.handler = async () => {
  let responseBody = "";

  try {
    const { Items } = await docClient
      .scan({ TableName: "GmailTokenTable" })
      .promise();

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
              setAccessToken(access_token);

              const { data: watchData } = await gmailAxios.post(
                `/gmail/v1/users/${id}/watch`,
                { topicName: `projects/${project_id}/topics/gmail-api` }
              );

              console.log("watch data:", watchData);
              await docClient
                .put({
                  TableName: "GmailTokenTable",
                  Item: { ...item, ...watchData },
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
