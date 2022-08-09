import ddbClient from "../lib/dynamodb-client";
const {
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  QueryCommand,
  DeleteItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
import { v4 } from "uuid";
const { toUTC } = require("../shared/toUTC");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

export async function getCustomUserType(data) {
  try {
    const param = {
      TableName: "CustomUserTypeTable",
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
    console.log(resp);
  }
  return resp;
}

export async function listCustomUserType() {
  try {
    const param = {
      TableName: "CustomUserTypeTable",
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

export async function createCustomUserType(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      createdAt: toUTC(new Date()),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "CustomUserTypeTable",
      Item: param,
    });

    const request = await ddbClient.send(cmd);

    if (request) {
      const companyClientParams = {
        id: v4(),
        customUserTypeId: rawParams.id,
        companyId: data.companyId,
        createdAt: toUTC(new Date()),
      };

      const companyClientCommand = new PutItemCommand({
        TableName: "CompanyCustomUserTypeTable",
        Item: marshall(companyClientParams),
      });

      const companyClientRequest = await ddbClient.send(companyClientCommand);
      resp = companyClientRequest
        ? {
            ...rawParams,
            companyId: data.companyId,
          }
        : {};
    }
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

export async function updateCustomUserType(id, data) {
  let resp = {};
  try {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      UpdateExpression,
    } = getUpdateExpressions(data);

    const param = {
      id,
      ...data,
    };

    const cmd = new UpdateItemCommand({
      TableName: "CustomUserTypeTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });
    const request = await ddbClient.send(cmd);
    resp = request ? param : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

export function getUpdateExpressions(data) {
  const values = {};
  const names = {};
  let updateExp = "set ";
  const dataFlatkeys = Object.keys(data);
  for (let i = 0; i < dataFlatkeys.length; i++) {
    names[`#${dataFlatkeys[i]}`] = dataFlatkeys[i];
    values[`:${dataFlatkeys[i]}Val`] = data[dataFlatkeys[i]];

    let separator = i == dataFlatkeys.length - 1 ? "" : ", ";
    updateExp += `#${dataFlatkeys[i]} = :${dataFlatkeys[i]}Val${separator}`;
  }
  return {
    UpdateExpression: updateExp,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: marshall(values),
  };
}
