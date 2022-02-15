const client = require("../../../lib/dynamodb-client");
const {
  GetItemCommand,
  ScanCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { getUser } = require("../../../services/UserService");
const { getMatterFile } = require("../../../services/MatterService");

// async function getCompany(data) {
//   try {
//     const params = {
//       TableName: "CompanyTable",
//       Key: marshall({
//         id: data.id,
//       }),
//     };

//     const command = new GetItemCommand(params);
//     const { Item } = await client.send(command);
//     response = Item ? unmarshall(Item) : {};
//   } catch (e) {
//     response = {
//       error: e.message,
//       errorStack: e.stack,
//       statusCode: 500,
//     };
//   }

//   return response;
// }

// async function listPages() {
//   try {
//     const params = {
//       TableName: "PageTable",
//     };

//     const command = new ScanCommand(params);
//     const request = await client.send(command);
//     const parseResponse = request.Items.map((data) => unmarshall(data));
//     response = request ? parseResponse : {};
//   } catch (e) {
//     response = {
//       error: e.message,
//       errorStack: e.stack,
//       statusCode: 500,
//     };
//   }

//   return response;
// }

// async function getCompanyAccessType(data) {
//   try {
//     const params = {
//       TableName: "CompanyAccessTypeTable",
//       IndexName: "byCompany",
//       KeyConditionExpression: "companyId = :companyId",
//       ExpressionAttributeValues: marshall({
//         ":companyId": data.companyId,
//       }),
//     };

//     const command = new QueryCommand(params);
//     const request = await client.send(command);
//     var parseResponse = request.Items.map((data) => unmarshall(data));

//     if (data.userType) {
//       parseResponse = request.Items.map((data) => unmarshall(data)).filter(
//         (userType) => userType.userType === data.userType
//       );
//     }
//     response = request ? parseResponse : {};
//   } catch (e) {
//     response = {
//       error: e.message,
//       errorStack: e.stack,
//       statusCode: 500,
//     };
//   }
//   return response;
// }

// async function getFeature(data) {
//   try {
//     const params = {
//       TableName: "FeatureTable",
//       Key: marshall({
//         id: data.id,
//       }),
//     };

//     const command = new GetItemCommand(params);
//     const { Item } = await client.send(command);
//     response = Item ? unmarshall(Item) : {};
//   } catch (e) {
//     response = {
//       error: e.message,
//       errorStack: e.stack,
//       statusCode: 500,
//     };
//   }
//   return response;
// }

// async function getClient(data) {
//   try {
//     const params = {
//       TableName: "ClientsTable",
//       IndexName: "byCompany",
//       KeyConditionExpression: "companyId = :companyId",
//       ExpressionAttributeValues: marshall({
//         ":companyId": data.companyId,
//       }),
//     };

//     const command = new QueryCommand(params);
//     const request = await client.send(command);
//     var response = request.Items.map((data) => unmarshall(data));
//   } catch (e) {
//     console.log(e);
//     response = {
//       error: e.message,
//       errorStack: e.stack,
//       statusCode: 500,
//     };
//   }
//   return response;
// }

// async function getMatter(data) {
//   try {
//     const params = {
//       TableName: "MatterTable",
//       IndexName: "byCompany",
//       KeyConditionExpression: "companyId = :companyId",
//       ExpressionAttributeValues: marshall({
//         ":companyId": data.companyId,
//       }),
//     };

//     const command = new QueryCommand(params);
//     const request = await client.send(command);
//     var response = request.Items.map((data) => unmarshall(data));
//   } catch (e) {
//     console.log(e);
//     response = {
//       error: e.message,
//       errorStack: e.stack,
//       statusCode: 500,
//     };
//   }
//   return response;
// }

async function listCompanyUsers(ctx) {
  const { id } = ctx.source;
  const { limit = 10, nextToken } = ctx.args;

  try {
    const params = {
      TableName: "CompanyUserTable",
      IndexName: "byCompany",
      KeyConditionExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall({
        ":companyId": id,
      }),
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
      Limit: limit,
    };

    const command = new QueryCommand(params);
    const result = await client.send(command);
    return {
      items: result.Items.map((i) => unmarshall(i)),
      nextToken: result.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
            "base64"
          )
        : null,
    };
  } catch (e) {
    console.log(e);
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }
  return response;
}

const resolvers = {
  Company: {
    users: async (ctx) => {
      return listCompanyUsers(ctx);
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
