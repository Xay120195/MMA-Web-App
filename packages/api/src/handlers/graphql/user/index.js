const ddbClient = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

async function listUserClientMatter(ctx) {
  console.log("listUserClientMatter()");
  const { id } = ctx.source;
  const { limit, nextToken, sortOrder = "CREATED_DESC" } = ctx.arguments;

  let indexName, isAscending;

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
    const userClientMatterParams = {
      TableName: "UserClientMatterTable",
      IndexName: indexName,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: marshall({
        ":userId": id,
      }),
      ScanIndexForward: isAscending,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      userClientMatterParams.Limit = limit;
    }

    const userClientMatterCommand = new QueryCommand(userClientMatterParams);
    const userClientMatterResult = await ddbClient.send(userClientMatterCommand);

    const clientMatterIds = userClientMatterResult.Items.map((i) =>
      unmarshall(i)
    ).map((f) => marshall({ id: f.clientMatterId }));

    if (clientMatterIds.length !== 0) {
      let unique = clientMatterIds
        .map((a) => unmarshall(a))
        .map((x) => x.id)
        .filter(function (item, i, ar) {
          return ar.indexOf(item) === i;
        });

      const uniqueBackgroundIds = unique.map((f) => marshall({ id: f }));

      const clientMattersParams = {
        RequestItems: {
          BackgroundsTable: {
            Keys: uniqueBackgroundIds,
          },
        },
      };

      const clientMattersCommand = new BatchGetItemCommand(clientMattersParams);
      const clientMattersResult = await ddbClient.send(clientMattersCommand);

      const objBackgrounds = clientMattersResult.Responses.BackgroundsTable.map(
        (i) => unmarshall(i)
      );
      const objUserClientMatter = userClientMatterResult.Items.map((i) =>
        unmarshall(i)
      );

      const response = objUserClientMatter.map((item) => {
        const filterBackground = objBackgrounds.find(
          (u) => u.id === item.clientMatterId
        );
        return { ...item, ...filterBackground };
      });
      return {
        items: response,
        nextToken: userClientMatterResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(userClientMatterResult.LastEvaluatedKey)
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
  User: {
    clientMatters: async (ctx) => {
      console.log("listUserClientMatter");
      return listUserClientMatter(ctx);
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
