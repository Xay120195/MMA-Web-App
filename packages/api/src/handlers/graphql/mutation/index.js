const client = require("../../../lib/dynamodb-client");
const { PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4 } = require("uuid");

async function createCompany(data) {
  const params = {
    id: v4(),
    name: data.name,
    representative: data.representative,
    createdAt: new Date().toISOString()
  };
  const command = new PutItemCommand({
    TableName: "CompanyTable",
    Item: marshall(params),
  });
  await client.send(command);
  return params;
}

async function createUser(data) {
  const params = {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    userType: data.userType,
    company: data.company,
    createdAt: new Date().toISOString()
  };

  const command = new PutItemCommand({
    TableName: "UserTable",
    Item: marshall(params),
  });
  await client.send(command);
  return params;
}

async function createPage(data) {
  const params = {
    id: v4(),
    name: data.name,
    label: data.label,
    route: data.route,
    features: data.features,
    createdAt: new Date().toISOString()
  };

  const command = new PutItemCommand({
    TableName: "PageTable",
    Item: marshall(params),
  });
  await client.send(command);
  return params;
}

async function createFeature(data) {
  const params = {
    id: v4(),
    name: data.name,
    label: data.label,
    page: data.page,
    createdAt: new Date().toISOString()
  };
  const command = new PutItemCommand({
    TableName: "FeatureTable",
    Item: marshall(params),
  });
  await client.send(command);
  return params;
}

const resolvers = {
  Mutation: {
    companyCreate: async (ctx) => {
      return createCompany(ctx.arguments);
    },
    userCreate: async (ctx) => {
      return createUser(ctx.arguments);
    },
    pageCreate: async (ctx) => {
      return createPage(ctx.arguments);
    },
    featureCreate: async (ctx) => {
      return createFeature(ctx.arguments);
    }
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
