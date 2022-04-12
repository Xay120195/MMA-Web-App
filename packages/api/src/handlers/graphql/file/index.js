const ddbClient = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { generatePresignedUrl } = require("../../../services/MatterService");

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

      const response = objFileLabels.map((item) => {
        const filterLabel = objLabels.find((u) => u.id === item.labelId);
        return { ...item, ...filterLabel };
      });
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
      statusCode: 500,
    };
    console.log(response);
  }
  return response;
}

const resolvers = {
  File: {
    downloadURL: async (ctx) => {
      return generatePresignedUrl(
        "public/" + ctx.source.s3ObjectKey,
        ctx.source
      );
    },
    labels: async (ctx) => {
      return listFileLabels(ctx);
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
