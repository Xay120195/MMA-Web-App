const fs = require("fs");
const util = require("util");
const { google } = require("googleapis");
const readFilePromise = util.promisify(fs.readFile);

const axios = require("axios");
const gql = require("graphql-tag");
const graphql = require("graphql");
const { print } = graphql;

const getUserOAuth = gql`
  query GetUserOAuth($username: ID!, $email: String!) {
    getUserOAuth(username: $username, email: $email) {
      username
      email
      token
    }
  }
`;

async function listThreads(event) {
  /**
   * Query Token from UserOAuth Model via Appsync
   */

  const graphqlData = await axios({
    url: "https://gcc3d6dwenay3mhziccbzzjhvq.appsync-api.ap-southeast-1.amazonaws.com/graphql",
    method: "post",
    headers: {
      Authorization: event.request.headers.authorization,
    },
    data: {
      query: print(getUserOAuth),
      variables: {
        username: event.identity.username,
        email: event.arguments.email,
      },
    },
  });

  const result = await readFilePromise("credentials.json");
  const credentials = JSON.parse(result);
  const { client_secret, client_id } = credentials.web;
  const auth = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost:4000"
  );

  const token = graphqlData.data.data.getUserOAuth.token;
  auth.setCredentials(JSON.parse(token));

  const gmail = google.gmail({ version: "v1", auth });
  let messages = await gmail.users.threads.list(
    {
      userId: "me",
    },
    {}
  );
  console.log(messages.data);
  return messages.data.threads;
}

module.exports = {
  listThreads,
};
