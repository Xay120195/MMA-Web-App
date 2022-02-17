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
  const { limit, nextToken } = ctx.args;

  console.log(ctx.args);
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
      Limit: limit ? limit : 100,
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
