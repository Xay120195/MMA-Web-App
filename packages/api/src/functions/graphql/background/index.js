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
    const backgroundFilesParam = {
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
      backgroundFilesParam.Limit = limit;
    }

    const backgroundFilesCmd = new QueryCommand(backgroundFilesParam);
    const backgroundFilesResult = await client.send(backgroundFilesCmd);

    const fileIds = backgroundFilesResult.Items.map((i) => unmarshall(i)).map(
      (f) => marshall({ id: f.fileId })
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
      const objBackgroundFiles = backgroundFilesResult.Items.map((i) =>
        unmarshall(i)
      );

      const response = objBackgroundFiles.map((item) => {
        const filterFile = objFiles.find((u) => u.id === item.fileId);
        return { ...item, ...filterFile };
      });

      return {
        items: response,
        nextToken: backgroundFilesResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(backgroundFilesResult.LastEvaluatedKey)
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

async function listBackgroundBrief(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken, isDeleted = false } = ctx.arguments;

  try {
    const backgroundBriefsParam = {
      TableName: "BriefBackgroundTable",
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
      backgroundBriefsParam.Limit = limit;
    }

    const backgroundBriefsCmd = new QueryCommand(backgroundBriefsParam);
    const backgroundBriefsResult = await client.send(backgroundBriefsCmd);

    const briefIds = backgroundBriefsResult.Items.map((i) => unmarshall(i)).map(
      (f) => marshall({ id: f.briefId })
    );

    if (briefIds.length !== 0) {
      const briefsParam = {
        RequestItems: {
          BriefTable: {
            Keys: briefIds,
          },
        },
      };

      const briefsCommand = new BatchGetItemCommand(briefsParam);
      const briefsResult = await client.send(briefsCommand);

      const objBriefs = briefsResult.Responses.BriefTable.map((i) =>
        unmarshall(i)
      );

      let filterObjBrief;

      if (isDeleted === false) {
        // for old data
        filterObjBrief = objBriefs.filter(
          (u) => u.isDeleted === false || u.isDeleted === undefined
        );
      } else {
        filterObjBrief = objBriefs.filter((u) => u.isDeleted === isDeleted);
      }

      const objBackgroundBriefs = backgroundBriefsResult.Items.map((i) =>
        unmarshall(i)
      );

      const response = objBackgroundBriefs
        .map((item) => {
          const filterBrief = filterObjBrief.find((u) => u.id === item.briefId);
          if (filterBrief !== undefined) {
            return { ...item, ...filterBrief };
          }
        })
        .filter((a) => a !== undefined);

      return {
        items: response,
        nextToken: backgroundBriefsResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(backgroundBriefsResult.LastEvaluatedKey)
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
    briefs: async (ctx) => {
      return listBackgroundBrief(ctx);
    },
  },
};

exports.handler = async (ctx) => {
  console.log("~aqs.watch:: run background >>", ctx.info.fieldName, ctx.arguments);
  const typeHandler = resolvers[ctx.info.parentTypeName];
  if (typeHandler) {
    const resolver = typeHandler[ctx.info.fieldName];
    if (resolver) {
      return await resolver(ctx);
    }
  }
  throw new Error("Resolver not found.");
};
