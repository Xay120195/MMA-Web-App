const ddbClient = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

async function listBriefBackground(ctx) {
  const { id } = ctx.source;
  const { sortOrder = "CREATED_DESC" } = ctx.arguments;

  let indexName,
    isAscending = true,
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

      if (sortByDate) {
        response.sort(function (a, b) {
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
  console.log("~aqs.watch:: run brief >>", ctx.info.fieldName);
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
