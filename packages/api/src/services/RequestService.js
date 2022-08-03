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

export async function getRequest(data) {
  let resp = {};
  try {
    const param = {
      TableName: "RequestTable",
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

export async function listRequests() {
  let resp = {};
  try {
    const param = {
      TableName: "RequestTable",
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

export async function createRequest(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      question: data.question,
      answer: data.answer,
      createdAt: toUTC(new Date()),
      order: data.order ? data.order : 0,
      itemNo: data.itemNo,
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "RequestTable",
      Item: param,
    });
    const req = await ddbClient.send(cmd);

    const rfiRequestParams = {
      id: v4(),
      requestId: rawParams.id,
      rfiId: data.rfiId,
      createdAt: toUTC(new Date()),
    };

    const rfiRequestCmd = new PutItemCommand({
      TableName: "RFIRequestTable",
      Item: marshall(rfiRequestParams),
    });

    const rfiRequestReq = await ddbClient.send(rfiRequestCmd);

    resp = rfiRequestReq ? rawParams : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

export async function updateRequest(id, data) {
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
      TableName: "RequestTable",
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

export async function deleteRequest(id) {
  let resp = {};
  try {
    const rfiRequestParams = {
      TableName: "RFIRequestTable",
      IndexName: "byRequest",
      KeyConditionExpression: "requestId = :requestId",
      ExpressionAttributeValues: marshall({
        ":requestId": id,
      }),
      ProjectionExpression: "id", // fetch id of RFIRequestTable only
    };

    const rfiRequestCmd = new QueryCommand(rfiRequestParams);
    const rfiRequestResult = await ddbClient.send(rfiRequestCmd);

    const rfiRequestId = rfiRequestResult.Items[0];

    const deleteRFIRequestCommand = new DeleteItemCommand({
      TableName: "RFIRequestTable",
      Key: rfiRequestId,
    });

    const deleteRFIRequestResult = await ddbClient.send(
      deleteRFIRequestCommand
    );

    if (deleteRFIRequestResult) {
      const cmd = new DeleteItemCommand({
        TableName: "RequestTable",
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
