import ddbClient from "../lib/dynamodb-client";
const {
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  QueryCommand,
  BatchWriteItemCommand,
  BatchGetItemCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../lib/s3-client");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4 } = require("uuid");
const { toUTC } = require("../shared/toUTC");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

export async function generatePresignedUrl(Key, src, origin) {
  // console.log("generatePresignedUrl", src);

  let fileScr = "gmail-api";

  if (!src.isGmailAttachment && !src.isGmailPDF && origin === "file-bucket") {
    fileScr = "file-bucket";
  }

  const bucket =
    fileScr === "gmail-api"
      ? process.env.REACT_APP_S3_GMAIL_ATTACHMENT_BUCKET
      : process.env.REACT_APP_S3_UPLOAD_BUCKET;

  const request = {
    Bucket: bucket,
    Key: "public/" + Key,
  };

  if (src.type) {
    if (
      src.type.split("/").slice(0, -1).join("/") !== "image" &&
      src.type !== "application/pdf"
    ) {
      request.ResponseContentDisposition = "attachment";
    }
  }

  const cmd = new GetObjectCommand(request);

  /**
   * Generate Pre-signed url using getSignedUrl expires after 1 hour
   */
  return getSignedUrl(s3Client, cmd, { expiresIn: 3600 });
}

export async function getMatterFiles(ctx) {
  const { matterId, isDeleted = false, sortOrder = "CREATED_DESC" } = ctx;

  let resp = {},
    indexName,
    isAscending = true,
    read = true,
    limit = ctx.limit,
    nextToken = ctx.nextToken,
    result = [],
    output = [],
    sortByDate = false;

  if (sortOrder.includes("_DESC")) {
    isAscending = false;
  }

  if (sortOrder.includes("CREATED_")) {
    indexName = "byCreatedAt";
  } else if (sortOrder.includes("ORDER_")) {
    indexName = "byOrder";
  } else if (sortOrder.includes("DATE_")) {
    // bypass limit and token - fetch all
    // sort result by date
    sortByDate = true;
    nextToken = null;
    limit = undefined;
    indexName = "byCreatedAt";
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
      const { Items, LastEvaluatedKey, Count } = await ddbClient.send(cmd);
      nextToken = LastEvaluatedKey;

      result.push(...Items);

      // if nextToken is has value
      // and items is empty
      // set param.ExclusiveStartKey to lastEvaluatedKey
      if (nextToken && Count === 0) {
        param.ExclusiveStartKey = LastEvaluatedKey;
      }

      // if array `result` has items
      // or theres nothing to paginate,
      // then stop the loop
      if ((Count > 0 && nextToken) || !nextToken) {
        read = false;
      }
    }

    output = result.map((d) => unmarshall(d));

    if (sortByDate) {
      output.sort(function (a, b) {
        if (a.date === undefined) {
          a.date = null;
        }
        if (b.date === undefined) {
          b.date = null;
        }

        if (isAscending) {
          return new Date(a.date) - new Date(b.date);
        } else {
          return new Date(b.date) - new Date(a.date);
        }
      });
    }

    resp = {
      items: output,
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

export async function listFiles() {
  try {
    const param = {
      TableName: "MatterFileTable",
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

export async function listFileLabels(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;
  try {
    const fileLabelsParams = {
      TableName: "FileLabelTable",
      IndexName: "byFile",
      KeyConditionExpression: "fileId = :fileId",
      ExpressionAttributeValues: marshall({
        ":fileId": id,
      }),
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      fileLabelsParams.Limit = limit;
    }

    const fileLabelsCommand = new QueryCommand(fileLabelsParams);
    const fileLabelsResult = await ddbClient.send(fileLabelsCommand);

    const labelIds = fileLabelsResult.Items.map((i) => unmarshall(i)).map((f) =>
      marshall({ id: f.labelId })
    );

    if (labelIds.length !== 0) {
      labelIds.filter(function (item, i, ar) {
        return ar.indexOf(item) === i;
      });

      const labelsParams = {
        RequestItems: {
          LabelsTable: {
            Keys: labelIds,
          },
        },
      };

      const labelsCommand = new BatchGetItemCommand(labelsParams);
      const labelsResult = await ddbClient.send(labelsCommand);

      const objLabels = labelsResult.Responses.LabelsTable.map((i) =>
        unmarshall(i)
      );
      const objFileLabels = fileLabelsResult.Items.map((i) => unmarshall(i));

      // const response = objFileLabels.map((item) => {
      //   const filterLabel = objLabels.find((u) => u.id === item.labelId);
      //   return { ...item, ...filterLabel };
      // });

      const response = objFileLabels
        .map((item) => {
          const filterLabel = objLabels.find((u) => u.id === item.labelId);

          if (filterLabel !== undefined) {
            return { ...item, ...filterLabel };
          }
        })
        .filter((a) => a !== undefined);

      return {
        items: response,
        nextToken: fileLabelsResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(fileLabelsResult.LastEvaluatedKey)
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

export async function listFileBackgrounds(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;
  try {
    const fileBackgroundsParams = {
      TableName: "BackgroundFileTable",
      IndexName: "byFile",
      KeyConditionExpression: "fileId = :fileId",
      ExpressionAttributeValues: marshall({
        ":fileId": id,
      }),
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      fileBackgroundsParams.Limit = limit;
    }

    const fileBackgroundsCommand = new QueryCommand(fileBackgroundsParams);
    const fileBackgroundsResult = await ddbClient.send(fileBackgroundsCommand);

    const backgroundIds = fileBackgroundsResult.Items.map((i) =>
      unmarshall(i)
    ).map((f) => marshall({ id: f.backgroundId }));

    if (backgroundIds.length !== 0) {
      backgroundIds.filter(function (item, i, ar) {
        return ar.indexOf(item) === i;
      });

      const backgroundsParams = {
        RequestItems: {
          BackgroundsTable: {
            Keys: backgroundIds,
          },
        },
      };

      const backgroundsCommand = new BatchGetItemCommand(backgroundsParams);
      const backgroundsResult = await ddbClient.send(backgroundsCommand);

      const objBackgrounds = backgroundsResult.Responses.BackgroundsTable.map(
        (i) => unmarshall(i)
      );
      const objFileBackgrounds = fileBackgroundsResult.Items.map((i) =>
        unmarshall(i)
      );

      // const response = objFileBackgrounds.map((item) => {
      //   const filterBackground = objBackgrounds.find(
      //     (u) => u.id === item.backgroundId
      //   );
      //   return { ...item, ...filterBackground };
      // });

      const response = objFileBackgrounds
        .map((item) => {
          const filterBackground = objBackgrounds.find(
            (u) => u.id === item.backgroundId
          );

          if (filterBackground !== undefined) {
            return { ...item, ...filterBackground };
          }
        })
        .filter((a) => a !== undefined);

      return {
        items: response,
        nextToken: fileBackgroundsResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(fileBackgroundsResult.LastEvaluatedKey)
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
      isGmailAttachment: data.isGmailAttachment ? true : false,
      isGmailPDF: data.isGmailPDF ? true : false,
      gmailMessageId: data.gmailMessageId ? data.gmailMessageId : "",
      date: data.date ? data.date : null,
      order: data.order ? data.order : 0,
      details: data.details ? data.details : "",
      createdAt: toUTC(new Date()),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "MatterFileTable",
      Item: param,
    });

    const request = await ddbClient.send(cmd);

    resp = unmarshall(param);
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
      var params = {
        id: v4(),
        matterId: data[i].matterId,
        s3ObjectKey: data[i].s3ObjectKey,
        size: data[i].size,
        type: data[i].type,
        name: data[i].name,
        details: data[i].details ? data[i].details : "",
        isDeleted: false,
        isGmailAttachment: data[i].isGmailAttachment ? true : false,
        isGmailPDF: data[i].isGmailPDF ? true : false,
        gmailMessageId: data[i].gmailMessageId ? data[i].gmailMessageId : "",
        date: data[i].date ? data[i].date : null,
        order: data[i].order ? data[i].order : 0,
        createdAt: toUTC(new Date()),
      };

      arrItems.push({
        PutRequest: {
          Item: marshall(params),
        },
      });
    }

    const batches = [];
    let current_batch = [],
      item_count = 0;

    arrItems.forEach((data) => {
      item_count++;
      current_batch.push(data);

      if (item_count % 20 == 0) {
        batches.push(current_batch);
        current_batch = [];
      }
    });

    if (current_batch.length > 0 && current_batch.length != 20) {
      batches.push(current_batch);
    }

    const asyncResult = await Promise.all(
      batches.map(async (data) => {
        const matterFileParams = {
          RequestItems: {
            MatterFileTable: data,
          },
        };

        const matterFileCmd = new BatchWriteItemCommand(matterFileParams);
        return await ddbClient.send(matterFileCmd);
      })
    );

    if (asyncResult) {
      resp = arrItems.map((i) => {
        return unmarshall(i.PutRequest.Item);
      });
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

export async function bulkSoftDeleteMatterFile(data) {
  let resp = [];
  try {
    const asyncResult = await Promise.all(
      data.id.map(async (id) => {
        const data = {
          updatedAt: toUTC(new Date()),
          isDeleted: true,
        };

        resp.push({ id });

        await softDeleteMatterFile(id, data);
      })
    );
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
    data.map(async (items) => {
      let id = items.id;
      let arrangement = items;
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

      const exec = await ddbClient.send(cmd);

      return exec;
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

export async function tagFileLabel(data) {
  let resp = {};
  try {
    const arrItems = [];

    const fileLabelIdParams = {
      TableName: "FileLabelTable",
      IndexName: "byFile",
      KeyConditionExpression: "fileId = :fileId",
      ExpressionAttributeValues: marshall({
        ":fileId": data.file.id,
      }),
    };

    const fileLabelIdCmd = new QueryCommand(fileLabelIdParams);
    const fileLabelIdRes = await ddbClient.send(fileLabelIdCmd);

    for (var a = 0; a < fileLabelIdRes.Items.length; a++) {
      var fileLabelId = { id: fileLabelIdRes.Items[a].id };
      arrItems.push({
        DeleteRequest: {
          Key: fileLabelId,
        },
      });
    }

    for (var i = 0; i < data.label.length; i++) {
      arrItems.push({
        PutRequest: {
          Item: marshall({
            id: v4(),
            fileId: data.file.id,
            labelId: data.label[i].id,
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

      // Chunk items to 25
      if (item_count % 25 == 0) {
        batches.push(current_batch);
        current_batch = [];
      }
    });

    // Add the last batch if it has records and is not equal to 25
    if (current_batch.length > 0 && current_batch.length != 25) {
      batches.push(current_batch);
    }

    batches.forEach(async (data) => {
      const fileLabelParams = {
        RequestItems: {
          FileLabelTable: data,
        },
      };

      const fileLabelCmd = new BatchWriteItemCommand(fileLabelParams);
      const req = await ddbClient.send(fileLabelCmd);
      console.log(req);
    });

    resp = { file: { id: data.file.id } };
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
