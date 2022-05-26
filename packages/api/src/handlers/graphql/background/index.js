const client = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

async function listBackgroundFiles(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;
  try {
    const cmFilesParam = {
      TableName: "BackgroundFileTable",
      IndexName: "byBackground",
      KeyConditionExpression: "backgroundId = :backgroundId",
      ExpressionAttributeValues: marshall({
        ":backgroundId": id,
      }),
      ScanIndexForward: false,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      cmFilesParam.Limit = limit;
    }

    const cmFilesCmd = new QueryCommand(cmFilesParam);
    const cmFilesResult = await client.send(cmFilesCmd);

    const fileIds = cmFilesResult.Items.map((i) => unmarshall(i)).map((f) =>
      marshall({ id: f.fileId })
    );

    if (fileIds.length !== 0) {
      const filesParam = {
        RequestItems: {
          MatterFileTable: {
            Keys: fileIds,
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
  Background: {
    files: async (ctx) => {
      return listBackgroundFiles(ctx);
    },
  },
};

exports.handler = async (ctx) => {
  console.log("~aqs.watch:: run background >>", ctx.info.fieldName);
  console.log("~aqs.watch:: arguments >>", ctx.arguments);
  const typeHandler = resolvers[ctx.info.parentTypeName];
  if (typeHandler) {
    const resolver = typeHandler[ctx.info.fieldName];
    if (resolver) {
      return await resolver(ctx);
    }
  }
  throw new Error("Resolver not found.");
};
