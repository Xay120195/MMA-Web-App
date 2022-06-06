const {
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");
import { AdminCreateUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import ddbClient from "../lib/dynamodb-client";
import identityClient from "../lib/cognito-identity-provider-client";
import randomString from "../shared/randomString";
import { v4 } from "uuid";
const { toUTC, toLocalTime } = require("../shared/toUTC");

export async function getUser(data) {
  let resp = {};
  try {
    const param = {
      TableName: "UserTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const cmd = new GetItemCommand(param);
    const { Item } = await ddbClient.send(cmd);
    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
  }

  return resp;
}

export async function listUsers() {
  let resp = {};
  try {
    const param = {
      TableName: "UserTable",
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

export async function createUser(data) {
  let resp = {};
  try {
    const rawParams = {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      userType: data.userType,
      company: data.company,
      createdAt: toUTC(new Date()),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "UserTable",
      Item: param,
    });

    const request = await ddbClient.send(cmd);

    const compUserParam = {
      id: v4(),
      userId: data.id,
      companyId: data.company.id,
      createdAt: toUTC(new Date()),
    };
    const putCompUserCmd = new PutItemCommand({
      TableName: "CompanyUserTable",
      Item: marshall(compUserParam),
    });

    const putCompUserCmdReq = await ddbClient.send(putCompUserCmd);

    resp = request ? unmarshall(param) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
  }
  return resp;
}

export async function inviteUser(data) {
  console.log(process.env);
  const user = await createCognitoUser({
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
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
  const cmd = new AdminCreateUserCommand(input);
  const resp = await identityClient.send(cmd);
  const id = resp.User.Attributes.filter((attrib) => attrib.Name === "sub")[0]
    .Value;
  resp.id = id;
  return resp;
}
