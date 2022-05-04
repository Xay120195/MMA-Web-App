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

export async function getMatterFiles(ctx) {
  console.log("getMatterFiles()");
  const {
    matterId,
    isDeleted = false,
    limit,
    sortOrder = "CREATED_DESC",
  } = ctx;

  let resp = {},
    indexName,
    isAscending,
    read = true,
    nextToken = ctx.nextToken,
    itemCount = 0,
    result = [];

  if (sortOrder == "CREATED_DESC" || sortOrder == "ORDER_DESC") {
    isAscending = false;
  } else if (sortOrder == "CREATED_ASC" || sortOrder == "ORDER_ASC") {
    isAscending = true;
  }

  if (sortOrder == "CREATED_DESC" || sortOrder == "CREATED_ASC") {
    indexName = "byCreatedAt";
  } else if (sortOrder == "ORDER_DESC" || sortOrder == "ORDER_ASC") {
    indexName = "byOrder";
  }

  try {
    const param = {
      TableName: "MatterFileTable",
      IndexName: indexName,
      KeyConditionExpression: "matterId = :matterId",
      FilterExpression: "isDeleted = :isDeleted",
      ExpressionAttributeValues: marshall({
        ":matterId": matterId,
        ":isDeleted": isDeleted,
      }),
      ScanIndexForward: isAscending,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      param.Limit = limit;
    }

    while (read === true) {
      const cmd = new QueryCommand(param);
      const { Items, LastEvaluatedKey } = await ddbClient.send(cmd);
      nextToken = LastEvaluatedKey;

      itemCount += Items.length;
      result.push(...Items);

      console.log("nextToken:", { nextToken });
      console.log("itemCount:", { itemCount });

      if (LastEvaluatedKey && Items.length === 0) {
        read = false;
        console.log("Inconsistent Read. Continue...");
      }

      if (!LastEvaluatedKey) {
        read = false;
        console.log("Done: NextToken is undefined");
      }

      if (itemCount === limit) {
        console.log("Reached ", limit, " limit.");
        console.log("Result:", result);
        read = false;
      }
    }

    resp = {
      items: result.map((d) => unmarshall(d)),
      nextToken: nextToken
        ? Buffer.from(JSON.stringify(nextToken)).toString("base64")
        : undefined,
    };
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
      date: null,
      order: data.order ? data.order : 0,
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

export async function bulkCreateMatterFile(data) {
  let resp = {};
  try {
    const arrItems = [];

    for (var i = 0; i < data.length; i++) {
      arrItems.push({
        PutRequest: {
          Item: marshall({
            id: v4(),
            matterId: data[i].matterId,
            s3ObjectKey: data[i].s3ObjectKey,
            size: data[i].size,
            type: data[i].type,
            name: data[i].name,
            isDeleted: false,
            date: null,
            order: data[i].order ? data[i].order : 0,
            createdAt: new Date().toISOString(),
          }),
        },
      });
    }

    let batches = [],
      current_batch = [],
      item_count = 0;

    arrItems.forEach((data) => {
      item_count++;
      current_batch.push(data);

      // Chunk items to 5
      if (item_count % 5 == 0) {
        batches.push(current_batch);
        current_batch = [];
      }
    });

    // Add the last batch if it has records and is not equal to 5
    if (current_batch.length > 0 && current_batch.length != 5) {
      batches.push(current_batch);
    }

    batches.forEach(async (data) => {
      const matterFileParams = {
        RequestItems: {
          MatterFileTable: data,
        },
      };

      const matterFileCmd = new BatchWriteItemCommand(matterFileParams);
      await ddbClient.send(matterFileCmd);
    });

    resp = arrItems.map((i) => {
      return unmarshall(i.PutRequest.Item);
    });
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

export async function bulkUpdateMatterFileOrders(data) {
  let resp = [];
  try {
    const asyncResult = await Promise.all(data.map(async (items) => {
      const id = items.id;
      const arrangement = items;
      delete arrangement.id;

      resp.push({
        id,
        ...items,
      });

      const {
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        UpdateExpression,
      } = getUpdateExpressions(arrangement);

      const cmd = new UpdateItemCommand({
        TableName: "MatterFileTable",
        Key: marshall({ id }),
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
      });

      await ddbClient.send(cmd);
    }));

    resp = asyncResult;
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
