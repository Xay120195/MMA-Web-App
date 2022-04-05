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
    const cmLabelsParam = {
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
      cmLabelsParam.Limit = limit;
    }

    const cmLabelsCmd = new QueryCommand(cmLabelsParam);
    const cmLabelsResult = await client.send(cmLabelsCmd);

    const labelIds = cmLabelsResult.Items.map((i) => unmarshall(i)).map((f) =>
      marshall({ id: f.labelId })
    );

    const labelsParam = {
      RequestItems: {
        LabelsTable: {
          Keys: labelIds,
        },
      },
    };

    const labelsCommand = new BatchGetItemCommand(labelsParam);
    const labelsResult = await client.send(labelsCommand);

    const objLabels = labelsResult.Responses.LabelsTable.map((i) =>
      unmarshall(i)
    );
    const objCMLabels = cmLabelsResult.Items.map((i) => unmarshall(i));

    const response = objCMLabels.map((item) => {
      const filterLabel = objLabels.find((u) => u.id === item.labelId);
      return { ...item, ...filterLabel };
    });

    return {
      items: response,
      nextToken: cmLabelsResult.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(cmLabelsResult.LastEvaluatedKey)).toString(
            "base64"
          )
        : null,
    };
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(response);
  }
  return response;
}

async function listCompanyMatterBackgrounds(ctx) {
  const { id } = ctx.source;

  const { limit, nextToken } = ctx.arguments;
  try {
    const cmBackgroundsParam = {
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
      cmBackgroundsParam.Limit = limit;
    }

    const cmBackgroundsCmd = new QueryCommand(cmBackgroundsParam);
    const cmBackgroundsResult = await client.send(cmBackgroundsCmd);

    const backgroundIds = cmBackgroundsResult.Items.map((i) =>
      unmarshall(i)
    ).map((f) => marshall({ id: f.backgroundId }));

    const backgroundsParam = {
      RequestItems: {
        BackgroundsTable: {
          Keys: backgroundIds,
        },
      },
    };

    const backgroundsCommand = new BatchGetItemCommand(backgroundsParam);
    const backgroundsResult = await client.send(backgroundsCommand);

    const objBackgrounds = backgroundsResult.Responses.BackgroundsTable.map(
      (i) => unmarshall(i)
    );
    const objCMBackgrounds = cmBackgroundsResult.Items.map((i) =>
      unmarshall(i)
    );

    const response = objCMBackgrounds.map((item) => {
      const filterBackground = objBackgrounds.find(
        (u) => u.id === item.backgroundId
      );
      return { ...item, ...filterBackground };
    });

    return {
      items: response,
      nextToken: cmBackgroundsResult.LastEvaluatedKey
        ? Buffer.from(
            JSON.stringify(cmBackgroundsResult.LastEvaluatedKey)
          ).toString("base64")
        : null,
    };
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
  ClientMatter: {
    labels: async (ctx) => {
      return listClientMatterLabels(ctx);
    },
    backgrounds: async (ctx) => {
      return listCompanyMatterBackgrounds(ctx);
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
