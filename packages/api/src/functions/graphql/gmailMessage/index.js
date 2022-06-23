const client = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

async function listGmailMessageClientMatters(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;
  try {
    const compClientMattersParam = {
      TableName: "GmailMessageClientMatterTable",
      IndexName: "byGmailMessage",
      KeyConditionExpression: "gmailMessageId = :gmailMessageId",
      ExpressionAttributeValues: marshall({
        ":gmailMessageId": id,
      }),
      ScanIndexForward: false,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      compClientMattersParam.Limit = limit;
    }

    const compClientMattersCmd = new QueryCommand(compClientMattersParam);
    const compClientMattersResult = await client.send(compClientMattersCmd);

    const clientMatterIds = compClientMattersResult.Items.map((i) => unmarshall(i)).map(
      (f) => marshall({ id: f.clientMatterId })
    );

    if (clientMatterIds.length !== 0) {
      const clientMattersParam = {
        RequestItems: {
          ClientMatterTable: {
            Keys: clientMatterIds,
          },
        },
      };

      const clientMattersCmd = new BatchGetItemCommand(clientMattersParam);
      const clientMattersResult = await client.send(clientMattersCmd);

      const objClientMatters = clientMattersResult.Responses.ClientMatterTable.map((i) =>
        unmarshall(i)
      );
      const objCompClientMatters = compClientMattersResult.Items.map((i) => unmarshall(i));

      const response = objCompClientMatters.map((item) => {
        const filterMatter = objClientMatters.find((u) => u.id === item.clientMatterId);
        return { ...item, ...filterMatter };
      });

      return {
        items: response,
        nextToken: compClientMattersResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(compClientMattersResult.LastEvaluatedKey)
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
  GmailMessage: {
    clientMatters: async (ctx) => {
      return listGmailMessageClientMatters(ctx);
    },
  },
};

exports.handler = async (ctx) => {
  console.log("~aqs.watch:: run gmailMessage >>", ctx.info.fieldName);
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
