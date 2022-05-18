const client = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

async function listLabelFiles(ctx) {
  console.log("listLabelFiles()");
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;

  try {
    const cmFilesParam = {
      TableName: "FileLabelTable",
      IndexName: "byLabel",
      KeyConditionExpression: "labelId = :labelId",
      ExpressionAttributeValues: marshall({
        ":labelId": id,
      }),
      ScanIndexForward: false,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
      ProjectionExpression: "fileId",
    };

    if (limit !== undefined) {
      cmFilesParam.Limit = limit;
    }

    const cmFilesCmd = new QueryCommand(cmFilesParam);
    const cmFilesResult = await client.send(cmFilesCmd);

    let unique = cmFilesResult.Items.map((a) => unmarshall(a))
      .map((x) => x.fileId)
      .filter(function (item, i, ar) {
        return ar.indexOf(item) === i;
      });

    const uniqueFileIds = unique.map((f) => marshall({ id: f }));

    if (uniqueFileIds.length !== 0) {
      const filesParam = {
        RequestItems: {
          MatterFileTable: {
            Keys: uniqueFileIds,
            FilterExpression: "isDeleted = :isDeleted",
            ExpressionAttributeValues: marshall({
              ":isDeleted": false,
            }),
          },
        },
      };

      const filesCommand = new BatchGetItemCommand(filesParam);
      const filesResult = await client.send(filesCommand);

      const objFiles = filesResult.Responses.MatterFileTable.map((i) =>
        unmarshall(i)
      );
      const objCMFiles = cmFilesResult.Items.map((i) => unmarshall(i));

      const response = objCMFiles.map((item) => {
        const filterFile = objFiles.find((u) => u.id === item.fileId);
        return { ...item, ...filterFile };
      });

      console.log("Batch Get Files:", response);

      return {
        items: response,
        nextToken: cmFilesResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(cmFilesResult.LastEvaluatedKey)
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

const resolvers = {
  Label: {
    files: async (ctx) => {
      return listLabelFiles(ctx);
    },
  },
};

exports.handler = async (ctx) => {
  const typeHandler = resolvers[ctx.info.parentTypeName];
  if (typeHandler) {
    const resolver = typeHandler[ctx.info.fieldName];
    if (resolver) {
      return await resolver(ctx);
    }
  }
  throw new Error("Resolver not found.");
};