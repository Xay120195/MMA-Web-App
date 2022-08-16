import ddbClient from "../lib/dynamodb-client";
const {
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { v4 } = require("uuid");
const { toUTC } = require("../shared/toUTC");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

export async function getCustomUserType(data) {
  let resp = {};
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

export async function listCustomUserTypes() {
  let resp = {};
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
      const companyCustomUserTypeParams = {
        id: v4(),
        customUserTypeId: rawParams.id,
        companyId: data.companyId,
        createdAt: toUTC(new Date()),
      };

      const companyCustomUserTypeCommand = new PutItemCommand({
        TableName: "CompanyCustomUserTypeTable",
        Item: marshall(companyCustomUserTypeParams),
      });

      const companyCustomUserTypeRequest = await ddbClient.send(
        companyCustomUserTypeCommand
      );
      resp = companyCustomUserTypeRequest
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

export async function deleteCustomUserType(id) {
  let resp = {};
  try {
    const companyCustomUserTypeParams = {
      TableName: "CompanyCustomUserTypeTable",
      IndexName: "byCustomUserType",
      KeyConditionExpression: "customUserTypeId = :customUserTypeId",
      ExpressionAttributeValues: marshall({
        ":customUserTypeId": id,
      }),
      ProjectionExpression: "id", // fetch id of CompanyCustomUserTypeTable only
    };

    const companyCustomUserTypeCmd = new QueryCommand(
      companyCustomUserTypeParams
    );
    const companyCustomUserTypeResult = await ddbClient.send(
      companyCustomUserTypeCmd
    );

    const companyCustomUserTypeId = companyCustomUserTypeResult.Items[0];

    const deleteCompanyCustomUserTypeCommand = new DeleteItemCommand({
      TableName: "CompanyCustomUserTypeTable",
      Key: companyCustomUserTypeId,
    });

    const deleteCompanyCustomUserTypeResult = await ddbClient.send(
      deleteCompanyCustomUserTypeCommand
    );

    if (deleteCompanyCustomUserTypeResult) {
      const cmd = new DeleteItemCommand({
        TableName: "CustomUserTypeTable",
        Key: marshall({ id }),
      });
      const request = await ddbClient.send(cmd);

      resp = request ? { id: id } : {};
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
