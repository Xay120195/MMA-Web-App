const ddbClient = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { generatePresignedUrl } = require("../../../services/MatterFileService");

async function listFileLabels(ctx) {
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

async function listFileBackgrounds(ctx) {
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

const resolvers = {
  File: {
    downloadURL: async (ctx) => {
      return generatePresignedUrl(
        ctx.source.s3ObjectKey,
        ctx.source,
        "file-bucket"
      );
    },
    labels: async (ctx) => {
      return listFileLabels(ctx);
    },
    backgrounds: async (ctx) => {
      return listFileBackgrounds(ctx);
    },
  },
};

exports.handler = async (ctx) => {
  console.log("~aqs.watch:: run file >>", ctx.info.fieldName, ctx.arguments);
  const typeHandler = resolvers[ctx.info.parentTypeName];
  if (typeHandler) {
    const resolver = typeHandler[ctx.info.fieldName];
    if (resolver) {
      return await resolver(ctx);
    }
  }
  throw new Error("Resolver not found.");
};