const ddbClient = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

async function listRFIRequests(ctx) {

  
  const { id } = ctx.source;
  const { limit, nextToken, sortOrder = "CREATED_DESC" } = ctx.arguments;

  console.log("listRFIRequests:", id);
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
    const rfiRequestsParams = {
      TableName: "RFIRequestTable",
      IndexName: indexName,
      KeyConditionExpression: "rfiId = :rfiId",
      ExpressionAttributeValues: marshall({
        ":rfiId": id,
      }),
      ScanIndexForward: isAscending,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      rfiRequestsParams.Limit = limit;
    }

    
    
    console.log(rfiRequestsParams);
    console.log("------------------------------------------------")
    const rfiRequestsCommand = new QueryCommand(rfiRequestsParams);
    console.log(rfiRequestsCommand);
    console.log("------------------------------------------------")

    const rfiRequestsResult = await ddbClient.send(rfiRequestsCommand);

    console.log(rfiRequestsResult);
    console.log("------------------------------------------------")

    const requestIds = rfiRequestsResult.Items.map((i) =>
      unmarshall(i)
    ).map((f) => marshall({ id: f.requestId }));

    if (requestIds.length !== 0) {
      let unique = requestIds
        .map((a) => unmarshall(a))
        .map((x) => x.id)
        .filter(function (item, i, ar) {
          return ar.indexOf(item) === i;
        });

      const uniqueRequestIds = unique.map((f) => marshall({ id: f }));

      const requestParams = {
        RequestItems: {
          RequestTable: {
            Keys: uniqueRequestIds,
          },
        },
      };

      const requestCommand = new BatchGetItemCommand(requestParams);
      const requestResult = await ddbClient.send(requestCommand);

      const objRequest = requestResult.Responses.RequestTable.map(
        (i) => unmarshall(i)
      );
      const objRFIRequests = rfiRequestsResult.Items.map((i) =>
        unmarshall(i)
      );

      const response = objRFIRequests.map((item) => {
        const filterRequest = objRequest.find(
          (u) => u.id === item.requestId
        );
        return { ...item, ...filterRequest };
      });
      return {
        items: response,
        nextToken: rfiRequestsResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(rfiRequestsResult.LastEvaluatedKey)
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
  RFI: {
    requests: async (ctx) => {
      return listRFIRequests(ctx);
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
