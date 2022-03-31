const client = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

async function listClientMatterLabels(ctx) {
  const { id } = ctx.source;

  const { limit, nextToken } = ctx.arguments;
  try {
    const clientMatterLabelsParams = {
      TableName: "ClientMatterLabelTable",
      IndexName: "byClientMatter",
      KeyConditionExpression: "clientMatterId = :clientMatterId",
      ExpressionAttributeValues: marshall({
        ":clientMatterId": id,
      }),
      ScanIndexForward: false,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      clientMatterLabelsParams.Limit = limit;
    }

    const clientMatterLabelsCommand = new QueryCommand(
      clientMatterLabelsParams
    );
    const clientMatterLabelsResult = await client.send(
      clientMatterLabelsCommand
    );

    const labelIds = clientMatterLabelsResult.Items.map((i) =>
      unmarshall(i)
    ).map((f) => marshall({ id: f.labelId }));

    const labelsParams = {
      RequestItems: {
        LabelsTable: {
          Keys: labelIds,
        },
      },
    };

    const labelsCommand = new BatchGetItemCommand(labelsParams);
    const labelsResult = await client.send(labelsCommand);

    const objLabels = labelsResult.Responses.LabelsTable.map((i) =>
      unmarshall(i)
    );
    const objClientMatterLabels = clientMatterLabelsResult.Items.map((i) =>
      unmarshall(i)
    );

    const response = objClientMatterLabels.map((item) => {
      const filterLabel = objLabels.find((u) => u.id === item.labelId);
      return { ...item, ...filterLabel };
    });

    return {
      items: response,
      nextToken: clientMatterLabelsResult.LastEvaluatedKey
        ? Buffer.from(
            JSON.stringify(clientMatterLabelsResult.LastEvaluatedKey)
          ).toString("base64")
        : null,
    };
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

async function listCompanyMatterBackgrounds(ctx) {
  const { id } = ctx.source;

  const { limit, nextToken } = ctx.arguments;
  try {
    const clientMatterBackgroundsParams = {
      TableName: "ClientMatterBackgroundTable",
      IndexName: "byClientMatter",
      KeyConditionExpression: "clientMatterId = :clientMatterId",
      ExpressionAttributeValues: marshall({
        ":clientMatterId": id,
      }),
      ScanIndexForward: false,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
      
    };

    if (limit !== undefined) {
      clientMatterBackgroundsParams.Limit = limit;
    }

    const clientMatterBackgroundsCommand = new QueryCommand(
      clientMatterBackgroundsParams
    );
    const clientMatterBackgroundsResult = await client.send(
      clientMatterBackgroundsCommand
    );

    const backgroundIds = clientMatterBackgroundsResult.Items.map((i) =>
      unmarshall(i)
    ).map((f) => marshall({ id: f.backgroundId }));

    const backgroundsParams = {
      RequestItems: {
        BackgroundsTable: {
          Keys: backgroundIds,
        },
      },
    };

    const backgroundsCommand = new BatchGetItemCommand(backgroundsParams);
    const backgroundsResult = await client.send(backgroundsCommand);

    const objBackgrounds = backgroundsResult.Responses.BackgroundsTable.map(
      (i) => unmarshall(i)
    );
    const objClientMatterBackgrounds = clientMatterBackgroundsResult.Items.map(
      (i) => unmarshall(i)
    );

    const response = objClientMatterBackgrounds.map((item) => {
      const filterBackground = objBackgrounds.find(
        (u) => u.id === item.backgroundId
      );
      return { ...item, ...filterBackground };
    });

    return {
      items: response,
      nextToken: clientMatterBackgroundsResult.LastEvaluatedKey
        ? Buffer.from(
            JSON.stringify(clientMatterBackgroundsResult.LastEvaluatedKey)
          ).toString("base64")
        : null,
    };
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
  ClientMatter: {
    labels: async (ctx) => {
      return listClientMatterLabels(ctx);
    },
    backgrounds: async (ctx) => {
      return listCompanyMatterBackgrounds(ctx);
    },
    // clients: async (ctx) => {
    //   return listCompanyClients(ctx);
    // },
    // clientMatters: async (ctx) => {
    //   return listCompanyClientMatters(ctx);
    // },
    // labels: async (ctx) => {
    //   return listCompanyLabels(ctx);
    // },
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
