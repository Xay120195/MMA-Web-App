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

    if (labelIds.length !== 0) {
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
          ? Buffer.from(
              JSON.stringify(cmLabelsResult.LastEvaluatedKey)
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

async function listCompanyMatterBackgrounds(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken, sortOrder = "CREATED_DESC" } = ctx.arguments;

  let indexName,
    isAscending;

  if (sortOrder == "CREATED_DESC" || sortOrder == "CREATED_ASC") {
    indexName = "byCreatedAt";
    isAscending = false;
  } else if (sortOrder == "ORDER_DESC" || sortOrder == "ORDER_ASC") {
    indexName = "byOrder";
    isAscending = true;
  }

  try {
    const cmBackgroundsParam = {
      TableName: "ClientMatterBackgroundTable",
      IndexName: indexName,
      KeyConditionExpression: "clientMatterId = :clientMatterId",
      ExpressionAttributeValues: marshall({
        ":clientMatterId": id,
      }),
      ScanIndexForward: isAscending,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      cmBackgroundsParam.Limit = limit;
    }

    const cmBackgroundsCmd = new QueryCommand(cmBackgroundsParam);
    const cmBackgroundsResult = await client.send(cmBackgroundsCmd);

    const objCMBackgrounds = cmBackgroundsResult.Items.map((i) =>
      unmarshall(i)
    );

    const backgroundIds = objCMBackgrounds.map((f) =>
      marshall({ id: f.backgroundId })
    );

    if (backgroundIds.length !== 0) {
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

async function listCompanyMatterRFIs(ctx) {
  const { id } = ctx.source;

  const { limit, nextToken } = ctx.arguments;

  try {
    const cmRFIsParam = {
      TableName: "ClientMatterRFITable",
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
      cmRFIsParam.Limit = limit;
    }

    const cmRFIsCmd = new QueryCommand(cmRFIsParam);
    const cmRFIsResult = await client.send(cmRFIsCmd);

    const rfiIds = cmRFIsResult.Items.map((i) => unmarshall(i)).map((f) =>
      marshall({ id: f.rfiId })
    );

    if (rfiIds.length !== 0) {
      const rfisParam = {
        RequestItems: {
          RFITable: {
            Keys: rfiIds,
          },
        },
      };

      const rfisCommand = new BatchGetItemCommand(rfisParam);
      const rfisResult = await client.send(rfisCommand);

      const objRFIs = rfisResult.Responses.RFITable.map((i) => unmarshall(i));
      const objCMRFIs = cmRFIsResult.Items.map((i) => unmarshall(i));

      const response = objCMRFIs.map((item) => {
        const filterRFI = objRFIs.find((u) => u.id === item.rfiId);
        return { ...item, ...filterRFI };
      });

      return {
        items: response,
        nextToken: cmRFIsResult.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(cmRFIsResult.LastEvaluatedKey)).toString(
              "base64"
            )
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
  ClientMatter: {
    labels: async (ctx) => {
      return listClientMatterLabels(ctx);
    },
    backgrounds: async (ctx) => {
      return listCompanyMatterBackgrounds(ctx);
    },
    rfis: async (ctx) => {
      return listCompanyMatterRFIs(ctx);
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
