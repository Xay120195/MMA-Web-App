const client = require("../../../lib/dynamodb-client");
const { GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4 } = require("uuid");

async function getCompany(data) {
  const command = new GetItemCommand({
    TableName: "CompanyTable",
    Key: marshall({
      id:data.id
    })
  });
  const response = await client.send(command);
  return unmarshall(response.Item)
}

const resolvers = {
  Query: {
    company: async (ctx) => {
      return getCompany(ctx.arguments);
    }
  }
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
