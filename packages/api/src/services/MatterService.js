const {
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
const { v4 } = require("uuid");
import ddbClient from "../lib/dynamodb-client";

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../lib/s3-client");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

export async function generatePresignedUrl(Key, src) {
  const request = {
    Bucket: process.env.REACT_APP_S3_UPLOAD_BUCKET,
    Key,
  };

  if (
    src.type.split("/").slice(0, -1).join("/") !== "image" &&
    src.type !== "application/pdf"
  ) {
    request.ResponseContentDisposition = "attachment";
  }

  const cmd = new GetObjectCommand(request);

  /**
   * Generate Pre-signed url using getSignedUrl expires after 1 hour
   */
  return getSignedUrl(s3Client, cmd, { expiresIn: 3600 });
}

export async function getMatterFile(data) {
  const { matterId, isDeleted = false, limit, nextToken } = data;

  let resp = {};
  try {
    const param = {
      TableName: "MatterFileTable",
      IndexName: "byMatter",
      KeyConditionExpression: "matterId = :matterId",
      FilterExpression: "isDeleted = :isDeleted",
      //ConsistentRead:true,
      ScanIndexForward: false,
      ExpressionAttributeValues: marshall({
        ":matterId": matterId,
        ":isDeleted": isDeleted,
      }),
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      param.Limit = limit;
    }

    const cmd = new QueryCommand(param);
    const request = await ddbClient.send(cmd);

    const result = request.Items.map((d) => unmarshall(d));
    if (request && request.Count !== 0) {
      result[0].nextToken = request.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(request.LastEvaluatedKey)).toString(
            "base64"
          )
        : null;
    }

    resp = request ? result : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

export async function getMatterFiles(data) {
  const { matterId, isDeleted = false, limit, nextToken } = data;

  let resp = {};
  try {
    const param = {
      TableName: "MatterFileTable",
      IndexName: "byMatter",
      KeyConditionExpression: "matterId = :matterId",
      FilterExpression: "isDeleted = :isDeleted",
      //ConsistentRead:true,
      ScanIndexForward: false,
      ExpressionAttributeValues: marshall({
        ":matterId": matterId,
        ":isDeleted": isDeleted,
      }),
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      param.Limit = limit;
    }

    const cmd = new QueryCommand(param);
    const request = await ddbClient.send(cmd);

    const result = request.Items.map((d) => unmarshall(d));

    // if (request && request.Count !== 0) {
    //   result[0].nextToken = request.LastEvaluatedKey
    //     ? Buffer.from(JSON.stringify(request.LastEvaluatedKey)).toString(
    //         "base64"
    //       )
    //     : null;
    // }

    resp = {
      items: request ? result : [],
      nextToken: request.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(request.LastEvaluatedKey)).toString(
            "base64"
          )
        : null,
    };

    console.log({ resp });
    // resp = request ? result : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

export async function getFile(data) {
  let resp = {};
  try {
    const param = {
      TableName: "MatterFileTable",
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

export async function createMatterFile(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      matterId: data.matterId,
      s3ObjectKey: data.s3ObjectKey,
      size: data.size,
      type: data.type,
      name: data.name,
      isDeleted: false,
      date: new Date().toISOString(),
      order: 0,
      createdAt: new Date().toISOString(),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "MatterFileTable",
      Item: param,
    });

    const request = await ddbClient.send(cmd);
    resp = request ? unmarshall(param) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

export async function softDeleteMatterFile(id, data) {
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
      TableName: "MatterFileTable",
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

export async function updateMatterFile(id, data) {
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
      TableName: "MatterFileTable",
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
