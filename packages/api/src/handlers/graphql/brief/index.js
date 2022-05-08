const ddbClient = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

async function listBriefBackground(ctx) {

  console.log("listBriefBackground()");
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;
  try {
    const briefBackgroundParams = {
      TableName: "BriefBackgroundTable",
      IndexName: "byBrief",
      KeyConditionExpression: "briefId = :briefId",
      ExpressionAttributeValues: marshall({
        ":briefId": id,
      }),
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      briefBackgroundParams.Limit = limit;
    }

    const briefBackgroundCommand = new QueryCommand(briefBackgroundParams);
    const briefBackgroundResult = await ddbClient.send(briefBackgroundCommand);

    const backgroundIds = briefBackgroundResult.Items.map((i) =>
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
      const objBriefBackground = briefBackgroundResult.Items.map((i) =>
        unmarshall(i)
      );

      const response = objBriefBackground.map((item) => {
        const filterBackground = objBackgrounds.find(
          (u) => u.id === item.backgroundId
        );
        return { ...item, ...filterBackground };
      });
      return {
        items: response,
        nextToken: briefBackgroundResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(briefBackgroundResult.LastEvaluatedKey)
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
  Brief: {
    backgrounds: async (ctx) => {
      return listBriefBackground(ctx);
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
