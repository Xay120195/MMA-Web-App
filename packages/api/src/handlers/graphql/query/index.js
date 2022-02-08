const client = require("../../../lib/dynamodb-client");
const {
  GetItemCommand,
  ScanCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { getUser } = require("../../../services/UserService");
const { getMatterFile } = require("../../../services/MatterService");

async function getCompany(data) {
  try {
    const params = {
      TableName: "CompanyTable",
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

async function listPages() {
  try {
    const params = {
      TableName: "PageTable",
    };

    const command = new ScanCommand(params);
    const request = await client.send(command);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    response = request ? parseResponse : {};
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
    const request = await client.send(command);
    var parseResponse = request.Items.map((data) => unmarshall(data));

    if (data.userType) {
      parseResponse = request.Items.map((data) => unmarshall(data)).filter(
        (userType) => userType.userType === data.userType
      );
    }
    response = request ? parseResponse : {};
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
  try {
    const params = {
      TableName: "FeatureTable",
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

async function getClient(data) {
  try {
    const params = {
      TableName: "ClientsTable",
      IndexName: "byCompany",
      KeyConditionExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall({
        ":companyId": data.companyId,
      }),
    };

    const command = new QueryCommand(params);
    const request = await client.send(command);
    var response = request.Items.map((data) => unmarshall(data));
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

async function getMatter(data) {
  try {
    const params = {
      TableName: "MatterTable",
      IndexName: "byCompany",
      KeyConditionExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall({
        ":companyId": data.companyId,
      }),
    };

    const command = new QueryCommand(params);
    const request = await client.send(command);
    var response = request.Items.map((data) => unmarshall(data));
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
    matter: async (ctx) => {
      return getMatter(ctx.arguments);
    },
    companyAccessType: async (ctx) => {
      return getCompanyAccessType(ctx.arguments);
    },

    matterFile: async (ctx) => {
      return getMatterFile(ctx.arguments);
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
