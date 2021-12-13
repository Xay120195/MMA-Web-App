const client = require("../../../lib/dynamodb-client");
const { GetItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

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

async function listPages() {
  const command = new ScanCommand({
    TableName: "PageTable"
  });

  const response = await client.send(command);
  const paraseResponse = response.Items.map(
    (data) => unmarshall(data)
);

console.log(paraseResponse);
  return paraseResponse;
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
    company: async (ctx) => {
      return getCompany(ctx.arguments);
    },
    page: async()=>{
      return listPages()
    },
    user: async (ctx) => {
      return getUser(ctx.arguments);
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

