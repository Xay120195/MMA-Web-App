const {
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  QueryCommand,
  BatchWriteItemCommand,
} = require("@aws-sdk/client-dynamodb");
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
const { v4 } = require("uuid");
import ddbClient from "../lib/dynamodb-client";

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../lib/s3-client");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

export async function generatePresignedUrl(Key) {
  const command = new GetObjectCommand({
    Bucket: process.env.REACT_APP_S3_UPLOAD_BUCKET,
    Key,
    // ResponseContentDisposition: "attachment",
  });

  /**
   * Generate Pre-signed url using getSignedUrl expires after 1 hour
   */
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getMatterFile(data) {
  const { matterId, isDeleted = false, limit, nextToken } = data;

  let response = {};
  try {
    const params = {
      TableName: "MatterFileTable",
      IndexName: "byMatter",
      KeyConditionExpression: "matterId = :matterId",
      FilterExpression: "isDeleted = :isDeleted",
      ExpressionAttributeValues: marshall({
        ":matterId": matterId,
        ":isDeleted": isDeleted,
      }),
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      params.Limit = limit;
    }

    const command = new QueryCommand(params);
    const request = await ddbClient.send(command);

    const result = request.Items.map((d) => unmarshall(d));

    if (request && result.length !== 0) {
      result[0].nextToken = request.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(request.LastEvaluatedKey)).toString(
            "base64"
          )
        : null;
    }

    response = request ? result : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
    console.log(response);
  }

  return response;
}

export async function getFile(data) {
  let response = {};
  try {
    const params = {
      TableName: "MatterFileTable",
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
    console.log(response);
  }
  return response;
}

export async function createMatterFile(data) {
  let response = {};
  try {
    const rawParams = {
      id: v4(),
      matterId: data.matterId,
      s3ObjectKey: data.s3ObjectKey,
      size: data.size,
      type: data.type,
      name: data.name,
      isDeleted: false,
      order: 0,
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "MatterFileTable",
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
    console.log(response);
  }

  return response;
}

export async function softDeleteMatterFile(id, data) {
  let response = {};

  try {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      UpdateExpression,
    } = getUpdateExpressions(data);

    const params = {
      id,
      ...data,
    };

    const command = new UpdateItemCommand({
      TableName: "MatterFileTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });
    const request = await ddbClient.send(command);
    response = request ? params : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
    console.log(response);
  }
  return response;
}

export async function updateMatterFile(id, data) {
  let response = {};
  try {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      UpdateExpression,
    } = getUpdateExpressions(data);

    const params = {
      id,
      ...data,
    };

    const command = new UpdateItemCommand({
      TableName: "MatterFileTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });
    const request = await ddbClient.send(command);
    response = request ? params : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
    console.log(response);
  }
  return response;
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
