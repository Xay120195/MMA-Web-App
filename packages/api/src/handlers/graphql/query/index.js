const client = require("../../../lib/dynamodb-client");
const {
  GetItemCommand,
  ScanCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

async function getCompany(data) {
  const command = new GetItemCommand({
    TableName: "CompanyTable",
    Key: marshall({
      id: data.id,
    }),
  });
  const response = await client.send(command);
  return unmarshall(response.Item);
}

async function listPages() {
  const command = new ScanCommand({
    TableName: "PageTable",
  });

  const response = await client.send(command);
  const parseResponse = response.Items.map((data) => unmarshall(data));

  return parseResponse;
}

async function getUser(data) {
  try {
    const params = {
      TableName: "UserTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const command = new GetItemCommand(params);

    const { Item } = await client.send(command);

    response = Item ? unmarshall(Item) : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

async function getCompanyAccessType(data) {
  try {
    const params = {
      TableName: "CompanyAccessTypeTable",
      IndexName: "byCompany",
      KeyConditionExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall({
        ":companyId": data.companyId,
      }),
    };

    const command = new QueryCommand(params);
    const result = await client.send(command);

    const parseResponse = result.Items.map((data) => unmarshall(data));
    response = result ? parseResponse : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

async function getFeature(data) {
  const command = new GetItemCommand({
    TableName: "FeatureTable",
    Key: marshall({
      id: data.id,
    }),
  });
  const response = await client.send(command);
  return unmarshall(response.Item);
}

async function getClient(data) {
  const command = new GetItemCommand({
    TableName: "ClientTable",
    Key: marshall({
      id: data.id,
    }),
  });
  const response = await client.send(command);
  return unmarshall(response.Item);
}

const resolvers = {
  Query: {
    company: async (ctx) => {
      return getCompany(ctx.arguments);
    },
    page: async () => {
      return listPages();
    },
    user: async (ctx) => {
      return getUser(ctx.arguments);
    },
    feature: async (ctx) => {
      return getFeature(ctx.arguments);
    },
    client: async (ctx) => {
      return getClient(ctx.arguments);
    },
    companyAccessType: async (ctx) => {
      return getCompanyAccessType(ctx.arguments);
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
