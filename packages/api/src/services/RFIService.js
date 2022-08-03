import ddbClient from "../lib/dynamodb-client";
const {
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  QueryCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
import { v4 } from "uuid";
const { toUTC } = require("../shared/toUTC");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

export async function getRFI(data) {
  let resp = {};
  try {
    const param = {
      TableName: "RFITable",
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

export async function listRFIs() {
  let resp = {};
  try {
    const param = {
      TableName: "RFITable",
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

export async function listRFIRequests(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken, sortOrder = "CREATED_DESC" } = ctx.arguments;

  let indexName,
    isAscending = true;

  if (sortOrder.includes("_DESC")) {
    isAscending = false;
  }

  if (sortOrder.includes("CREATED_")) {
    indexName = "byCreatedAt";
  } else if (sortOrder.includes("ORDER_")) {
    indexName = "byOrder";
  }

  try {
    const rfiRequestsParams = {
      TableName: "RFIRequestTable",
      IndexName: indexName,
      KeyConditionExpression: "rfiId = :rfiId",
      ExpressionAttributeValues: marshall({
        ":rfiId": id,
      }),
      ScanIndexForward: isAscending,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      rfiRequestsParams.Limit = limit;
    }

    const rfiRequestsCommand = new QueryCommand(rfiRequestsParams);

    const rfiRequestsResult = await ddbClient.send(rfiRequestsCommand);

    const requestIds = rfiRequestsResult.Items.map((i) => unmarshall(i)).map(
      (f) => marshall({ id: f.requestId })
    );

    if (requestIds.length !== 0) {
      let unique = requestIds
        .map((a) => unmarshall(a))
        .map((x) => x.id)
        .filter(function (item, i, ar) {
          return ar.indexOf(item) === i;
        });

      const uniqueRequestIds = unique.map((f) => marshall({ id: f }));

      const requestParams = {
        RequestItems: {
          RequestTable: {
            Keys: uniqueRequestIds,
          },
        },
      };

      const requestCommand = new BatchGetItemCommand(requestParams);
      const requestResult = await ddbClient.send(requestCommand);

      const objRequest = requestResult.Responses.RequestTable.map((i) =>
        unmarshall(i)
      );
      const objRFIRequests = rfiRequestsResult.Items.map((i) => unmarshall(i));

      // const response = objRFIRequests.map((item) => {
      //   const filterRequest = objRequest.find((u) => u.id === item.requestId);
      //   return { ...item, ...filterRequest };
      // });

      const response = objRFIRequests
        .map((item) => {
          const filterRequest = objRequest.find((u) => u.id === item.requestId);

          if (filterRequest !== undefined) {
            return { ...item, ...filterRequest };
          }
        })
        .filter((a) => a !== undefined);

      return {
        items: response,
        nextToken: rfiRequestsResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(rfiRequestsResult.LastEvaluatedKey)
            ).toString("base64")
          : null,
      };
    } else {
      return {
        items: [],
        nextToken: null,
      };
    }
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(response);
  }
  return response;
}

export async function createRFI(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      createdAt: toUTC(new Date()),
      order: data.order ? data.order : 0,
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "RFITable",
      Item: param,
    });
    const request = await ddbClient.send(cmd);

    const clientMatterRFIParams = {
      id: v4(),
      rfiId: rawParams.id,
      clientMatterId: data.clientMatterId,
      createdAt: toUTC(new Date()),
      isDeleted: false,
    };

    const clientMatterRFICommand = new PutItemCommand({
      TableName: "ClientMatterRFITable",
      Item: marshall(clientMatterRFIParams),
    });

    const clientMatterRFIRequest = await ddbClient.send(clientMatterRFICommand);

    resp = clientMatterRFIRequest ? rawParams : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

export async function updateRFI(id, data) {
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
      TableName: "RFITable",
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

export async function deleteRFI(id) {
  let resp = {};
  try {
    const clientMatterRFIParams = {
      TableName: "ClientMatterRFITable",
      IndexName: "byRFI",
      KeyConditionExpression: "rfiId = :rfiId",
      ExpressionAttributeValues: marshall({
        ":rfiId": id,
      }),
      ProjectionExpression: "id", // fetch id of ClientMatterRFITable only
    };

    const clientMatterRFICmd = new QueryCommand(clientMatterRFIParams);
    const clientMatterRFIResult = await ddbClient.send(clientMatterRFICmd);

    const clientMatterRFIId = clientMatterRFIResult.Items[0];

    const deleteClientMatterRFICommand = new DeleteItemCommand({
      TableName: "ClientMatterRFITable",
      Key: clientMatterRFIId,
    });

    const deleteClientMatterRFIResult = await ddbClient.send(
      deleteClientMatterRFICommand
    );

    if (deleteClientMatterRFIResult) {
      const cmd = new DeleteItemCommand({
        TableName: "RFITable",
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

export async function softDeleteRFI(id, data) {
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

    const clientMatterRFIParams = {
      TableName: "ClientMatterRFITable",
      IndexName: "byRFI",
      KeyConditionExpression: "rfiId = :rfiId",
      ExpressionAttributeValues: marshall({
        ":rfiId": id,
      }),
      ProjectionExpression: "id", // fetch id of ClientMatterRFITable only
    };

    const clientMatterRFICmd = new QueryCommand(clientMatterRFIParams);
    const clientMatterRFIResult = await ddbClient.send(clientMatterRFICmd);

    const clientMatterRFIId = clientMatterRFIResult.Items.map((i) =>
      unmarshall(i)
    )[0].id;

    const cmd = new UpdateItemCommand({
      TableName: "ClientMatterRFITable",
      Key: marshall({ id: clientMatterRFIId }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });

    const request = await ddbClient.send(cmd);

    resp = request ? { id: id } : {};
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
