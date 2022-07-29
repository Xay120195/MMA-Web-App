const ddbClient = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

async function listUserClientMatter(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;

  let indexName = "byUser",
    isAscending = false;

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
    const userClientMatterResult = await ddbClient.send(
      userClientMatterCommand
    );

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

      const uniqueClientMatterIds = unique.map((f) => marshall({ id: f }));

      const clientMattersParams = {
        RequestItems: {
          ClientMatterTable: {
            Keys: uniqueClientMatterIds,
          },
        },
      };

      const clientMattersCommand = new BatchGetItemCommand(clientMattersParams);
      const clientMattersResult = await ddbClient.send(clientMattersCommand);

      const objClientMatters =
        clientMattersResult.Responses.ClientMatterTable.map((i) =>
          unmarshall(i)
        );
      const objUserClientMatter = userClientMatterResult.Items.map((i) =>
        unmarshall(i)
      );

      const response = objUserClientMatter
        .map((item) => {
          const filterClientMatter = objClientMatters.find(
            (u) => u.id === item.clientMatterId
          );

          if (filterClientMatter !== undefined) {
            return { ...item, ...filterClientMatter };
          }
        })
        .filter((a) => a !== undefined);

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
    };
    console.log(response);
  }
  return response;
}

const resolvers = {
  User: {
    clientMatters: async (ctx) => {
      return listUserClientMatter(ctx);
    },
  },
};

exports.handler = async (ctx) => {
  console.log("~aqs.watch:: run user >>", ctx.info.fieldName, ctx.arguments);
  const typeHandler = resolvers[ctx.info.parentTypeName];
  if (typeHandler) {
    const resolver = typeHandler[ctx.info.fieldName];
    if (resolver) {
      return await resolver(ctx);
    }
  }
  throw new Error("Resolver not found.");
};
