const {
  docClient,
  refreshTokens,
  gmailAxios,
  setAccessToken,
  s3,
} = require("./lib");
const { client_id, client_secret, project_id } = require("./config");

const checkSubscriptions = async () => {

  console.log("Check Subscription");
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
              const { expiration, id, refresh_token } = item;

              if (new Date().getTime() < +expiration - 864000000) resolve();

              const {
                data: { access_token },
              } = await refreshTokens({
                refresh_token: refresh_token,
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
                })
                .catch((err) => console.log(err));

              console.log("watch data:", watchData);

              const items = {
                ...item,
                ...watchData,
                updatedAt: toUTC(new Date()),
              };

              console.log("Save to GmailTokenTable:", items);
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

module.exports = { handler: checkSubscriptions };
