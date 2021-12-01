const client = require("../../../lib/dynamodb-client");
const { PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4 } = require("uuid");

async function createCompany(data) {
  const params = {
    id: v4(),
    name: data.name,
    phone: data.phone,
  };
  const command = new PutItemCommand({
    TableName: "CompanyTable",
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
