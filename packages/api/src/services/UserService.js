const { PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
import { AdminCreateUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import ddbClient from "../lib/dynamodb-client";
import identityClient from "../lib/cognito-identity-provider-client";
import randomString from "../shared/randomString";
import { v4 } from "uuid";

export async function getUser(data) {
  let response = {};
  try {
    const params = {
      TableName: "UserTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const command = new GetItemCommand(params);
    const { Item } = await ddbClient.send(command);
    response = Item ? unmarshall(Item) : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

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

    //put on CompanyUser

    const companyUserParams = {
      id: v4(),
      userId: data.id,
      companyId: data.company.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const putCompanyUserCommand = new PutItemCommand({
      TableName: "CompanyUserTable",
      Item: marshall(companyUserParams),
    });

    const putCompanyUserCommandrequest = await ddbClient.send(
      putCompanyUserCommand
    );

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
    UserPoolId: "ap-southeast-1_GlTmW0Cpe",//process.env.REACT_APP_COGNITO_USER_POOL_ID,
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
  const id = response.User.Attributes.filter(
    (attrib) => attrib.Name === "sub"
  )[0].Value;
  response.id = id;
  return response;
}
