const client = require("../../../lib/dynamodb-client");
const { PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4 } = require("uuid");

async function createUser(data) {
  const params = {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    contactNumber: data.contactNumber,
    userType: data.userType,
    createdAt: new Date().toISOString()
  };

  const command = new PutItemCommand({
    TableName: "UserTable",
    Item: marshall(params),
  });
  await client.send(command);
  return params;
}

async function getUser(data) {
  const command = new GetItemCommand({
    TableName: "UserTable",
    Key: marshall({
      id:data.id
    })
  });
  const response = await client.send(command);
  return unmarshall(response.Item)
}

const resolvers = {
  Query: {
    user: async (ctx) => {
      return getUser(ctx.arguments);
    }
  },
  Mutation: {
    userCreate: async (ctx) => {
      return createUser(ctx.arguments);
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
