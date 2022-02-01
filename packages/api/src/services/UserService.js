const { PutItemCommand } = require("@aws-sdk/client-dynamodb");
import { AdminCreateUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import ddbClient from "../lib/dynamodb-client";
import identityClient from "../lib/cognito-identity-provider-client";
import AWS_COGNITO_USERPOOL_ID from "../constants";
import randomString from "../shared/randomString";
export async function createUser(data) {
  let response = {};
  try {
    const rawParams = {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      userType: data.userType,
      company: data.company,
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "UserTable",
      Item: params,
    });

    const request = await ddbClient.send(command);
    response = request ? unmarshall(params) : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }
  return response;
}

export async function inviteUser(data) {
  const user = await createCognitoUser({
    UserPoolId: AWS_COGNITO_USERPOOL_ID,
    Username: data.email,
    DesiredDeliveryMediums: ["EMAIL"],
    TemporaryPassword: randomString(),
    UserAttributes: [
      {
        Name: "email",
        Value: data.email,
      },
      {
        Name: "email_verified",
        Value: "true",
      },
    ],
  });

  data.id = user.id;
  return createUser(data);
}

async function createCognitoUser(input) {
  const command = new AdminCreateUserCommand(input);
  const response = await identityClient.send(command);
  const id = response.User.Attributes.filter((attrib) => attrib.Name === "sub")[0].Value;
  response.id = id;
  return response;
}
