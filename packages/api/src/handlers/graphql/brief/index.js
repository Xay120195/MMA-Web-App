const ddbClient = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

async function listBriefBackground(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken, sortOrder = "CREATED_DESC" } = ctx.arguments;

  let indexName, isAscending = true;

  if (sortOrder.includes("_DESC")) {
    isAscending = false;
  }

  if (sortOrder.includes("CREATED_")) {
    indexName = "byCreatedAt";
  } else if (sortOrder.includes("ORDER_")) {
    indexName = "byOrder";
  }

  try {
    const briefBackgroundParams = {
      TableName: "BriefBackgroundTable",
      IndexName: indexName,
      KeyConditionExpression: "briefId = :briefId",
      ExpressionAttributeValues: marshall({
        ":briefId": id,
      }),
      ScanIndexForward: isAscending,
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
      let unique = backgroundIds
        .map((a) => unmarshall(a))
        .map((x) => x.id)
        .filter(function (item, i, ar) {
          return ar.indexOf(item) === i;
        });

      const uniqueBackgroundIds = unique.map((f) => marshall({ id: f }));

      const backgroundsParams = {
        RequestItems: {
          BackgroundsTable: {
            Keys: uniqueBackgroundIds,
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
