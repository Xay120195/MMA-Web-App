const client = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { getUser } = require("../../../services/UserService");
const { getMatterFile } = require("../../../services/MatterService");

async function listCompanyUsers(ctx) {
  const { id } = ctx.source;
  const { limit = 100, nextToken } = ctx.args;
  try {
    const companyUsersParams = {
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

    console.log(companyUsersParams);

    const companyUsersCommand = new QueryCommand(companyUsersParams);
    const companyUsersResult = await client.send(companyUsersCommand);

    const userIds = companyUsersResult.Items.map((i) => unmarshall(i)).map(
      (f) => marshall({ id: f.userId })
    );

    const usersParams = {
      RequestItems: {
        UserTable: {
          Keys: userIds,
        },
      },
    };

    const usersCommand = new BatchGetItemCommand(usersParams);
    const usersResult = await client.send(usersCommand);

    const objUsers = usersResult.Responses.UserTable.map((i) => unmarshall(i));
    const objCompanyUsers = companyUsersResult.Items.map((i) => unmarshall(i));

    const response = objCompanyUsers.map((item) => {
      const filterUser = objUsers.find((u) => u.id === item.userId);
      return { ...item, ...filterUser };
    });

    return {
      items: response,
      nextToken: companyUsersResult.LastEvaluatedKey
        ? Buffer.from(
            JSON.stringify(companyUsersResult.LastEvaluatedKey)
          ).toString("base64")
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

async function listCompanyMatters(ctx) {
  const { id } = ctx.source;
  const { limit = 100, nextToken } = ctx.args;

  console.log(ctx.args);
  try {
    const companyMatterParams = {
      TableName: "CompanyMatterTable",
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

    console.log(companyMatterParams);

    const companyMatterCommand = new QueryCommand(companyMatterParams);
    const companyMatterResult = await client.send(companyMatterCommand);

    const matterIds = companyMatterResult.Items.map((i) => unmarshall(i)).map(
      (f) => marshall({ id: f.matterId })
    );

    const matterParams = {
      RequestItems: {
        MatterTable: {
          Keys: matterIds,
        },
      },
    };

    const mattersCommand = new BatchGetItemCommand(matterParams);
    const mattersResult = await client.send(mattersCommand);

    const objMatters = mattersResult.Responses.MatterTable.map((i) => unmarshall(i));
    const objCompanyMatters = companyMatterResult.Items.map((i) => unmarshall(i));

    const response = objCompanyMatters.map((item) => {
      const filterMatter = objMatters.find((u) => u.id === item.matterId);
      return { ...item, ...filterMatter };
    });

    return {
      items: response,
      nextToken: companyMatterResult.LastEvaluatedKey
        ? Buffer.from(
            JSON.stringify(companyMatterResult.LastEvaluatedKey)
          ).toString("base64")
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

async function listCompanyClients(ctx) {
  const { id } = ctx.source;
  const { limit = 100, nextToken } = ctx.args;

  console.log(ctx.args);
  try {
    const companyClientParams = {
      TableName: "CompanyClientTable",
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

    console.log(companyClientParams);

    const companyClientCommand = new QueryCommand(companyClientParams);
    const companyClientResult = await client.send(companyClientCommand);

    const clientIds = companyClientResult.Items.map((i) => unmarshall(i)).map(
      (f) => marshall({ id: f.clientId })
    );

    const clientParams = {
      RequestItems: {
        ClientsTable: {
          Keys: clientIds,
        },
      },
    };

    const clientsCommand = new BatchGetItemCommand(clientParams);
    const clientsResult = await client.send(clientsCommand);

    const objClients = clientsResult.Responses.ClientsTable.map((i) => unmarshall(i));
    const objCompanyClients = companyClientResult.Items.map((i) => unmarshall(i));

    const response = objCompanyClients.map((item) => {
      const filterClient = objClients.find((u) => u.id === item.clientId);
      return { ...item, ...filterClient };
    });

    return {
      items: response,
      nextToken: companyClientResult.LastEvaluatedKey
        ? Buffer.from(
            JSON.stringify(companyClientResult.LastEvaluatedKey)
          ).toString("base64")
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
    matters: async (ctx) => {
      return listCompanyMatters(ctx);
    },
    clients: async (ctx) => {
      return listCompanyClients(ctx);
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
