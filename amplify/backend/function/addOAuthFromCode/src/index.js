const axios = require("axios");
const gql = require("graphql-tag");
const graphql = require("graphql");
const { print } = graphql;
const { getTokensFromCode, getTokenInfo } = require("./exchangeToken");

const createUserOAuth = gql`
  mutation CreateUserOAuth(
    $input: CreateUserOAuthInput!
    $condition: ModelUserOAuthConditionInput
  ) {
    createUserOAuth(input: $input, condition: $condition) {
      username
      email
      token
    }
  }
`;

exports.handler = async (event) => {
  const { tokens } = await getTokensFromCode(event.arguments.code);
  const info = await getTokenInfo(tokens.access_token);

  try {
    console.log("headers", event.request.headers);
    console.log("arguments", event.arguments);
    console.log("identity", event.identity);

    const graphqlData = await axios({
      url: "https://gcc3d6dwenay3mhziccbzzjhvq.appsync-api.ap-southeast-1.amazonaws.com/graphql",
      method: "post",
      headers: {
        Authorization: event.request.headers.authorization,
      },
      data: {
        query: print(createUserOAuth),
        variables: {
          input: {
            username: event.identity.username,
            email: info.email,
            token: JSON.stringify(tokens),
          },
        },
      },
    });
    console.log(graphqlData.data);
    const body = {
      message: "OAuth Successfully Added !",
    };
    return {
      statusCode: 200,
      body: JSON.stringify(body),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    console.log("error creating oauth: ", err);
  }
};
