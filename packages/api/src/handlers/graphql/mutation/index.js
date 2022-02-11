const client = require("../../../lib/dynamodb-client");
const {
  PutItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4 } = require("uuid");

const { inviteUser, createUser } = require("../../../services/UserService");
const { createMatterFile } = require("../../../services/MatterService");

async function createCompany(data) {
  let response = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      representative: data.representative,
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "CompanyTable",
      Item: params,
    });

    const request = await client.send(command);
    response = request ? unmarshall(params) : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

async function createPage(data) {
  let response = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      label: data.label,
      route: data.route,
      features: data.features,
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "PageTable",
      Item: params,
    });

    const request = await client.send(command);
    response = request ? unmarshall(params) : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

async function createFeature(data) {
  let response = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      label: data.label,
      page: data.page,
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "FeatureTable",
      Item: params,
    });

    const request = await client.send(command);
    response = request ? unmarshall(params) : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

async function createCompanyAccessType(data) {
  let response = {};
  try {
    const rawParams = {
      id: v4(),
      companyId: data.companyId,
      userType: data.userType,
      access: data.access,
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "CompanyAccessTypeTable",
      Item: params,
    });

    console.log(unmarshall(params));
    const request = await client.send(command);
    response = request ? unmarshall(params) : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

async function updateCompanyAccessType(id, data) {
  let response = {};
  try {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      UpdateExpression,
    } = getUpdateExpressions(data);

    const params = {
      id,
      ...data,
    };

    console.log(data);

    const command = new UpdateItemCommand({
      TableName: "CompanyAccessTypeTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });
    const request = await client.send(command);
    response = request ? params : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

async function createClient(data) {
  let response = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      companyId: data.companyId,
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "ClientsTable",
      Item: params,
    });
    const request = await client.send(command);
    response = request ? unmarshall(params) : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

async function updateClientMatter(id, data) {
  let response = {};
  try {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      UpdateExpression,
    } = getUpdateExpressions(data);

    const params = {
      id,
      ...data,
    };

    const command = new UpdateItemCommand({
      TableName: "ClientsTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });

    console.log(data);

    const request = await client.send(command);
    response = request ? params : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }
  console.log(response);
  return response;
}

async function createMatter(data) {
  let response = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      companyId: data.companyId,
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "MatterTable",
      Item: params,
    });

    const request = await client.send(command);
    response = request ? unmarshall(params) : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

async function createBackground(data) {
  let response = {};
  try {
    const rawParams = {
      id: v4(),
      companyId: data.companyId,
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "BackgroundTable",
      Item: params,
    });

    console.log(params);

    const request = await client.send(command);
    response = request ? unmarshall(params) : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

async function updateBackground(id, data) {
  let response = {};
  try {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      UpdateExpression,
    } = getUpdateExpressions(data);

    const params = {
      id,
      ...data,
    };

    console.log(data);

    const command = new UpdateItemCommand({
      TableName: "BackgroundTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });
    const request = await client.send(command);
    response = request ? params : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }
  
  return response;
}

export function getUpdateExpressions(data) {
  const values = {};
  const names = {};
  let updateExp = "set ";
  const dataFlatkeys = Object.keys(data);
  for (let i = 0; i < dataFlatkeys.length; i++) {
    names[`#${dataFlatkeys[i]}`] = dataFlatkeys[i];
    values[`:${dataFlatkeys[i]}Val`] = data[dataFlatkeys[i]];

    let separator = i == dataFlatkeys.length - 1 ? "" : ", ";
    updateExp += `#${dataFlatkeys[i]} = :${dataFlatkeys[i]}Val${separator}`;
  }
  return {
    UpdateExpression: updateExp,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: marshall(values),
  };
}

const resolvers = {
  Mutation: {
    companyCreate: async (ctx) => {
      return await createCompany(ctx.arguments);
    },
    userCreate: async (ctx) => {
      return await createUser(ctx.arguments);
    },
    userInvite: async (ctx) => {
      return await inviteUser(ctx.arguments);
    },
    pageCreate: async (ctx) => {
      return await createPage(ctx.arguments);
    },
    featureCreate: async (ctx) => {
      return await createFeature(ctx.arguments);
    },
    clientCreate: async (ctx) => {
      return await createClient(ctx.arguments);
    },
    matterCreate: async (ctx) => {
      return await createMatter(ctx.arguments);
    },
    matterFileCreate: async (ctx) => {
      return await createMatterFile(ctx.arguments);
    },
    companyAccessTypeCreate: async (ctx) => {
      return await createCompanyAccessType(ctx.arguments);
    },
    companyAccessTypeUpdate: async (ctx) => {
      const { id, access } = ctx.arguments;
      const data = {
        access: access,
        updatedAt: new Date().toISOString(),
      };
      return await updateCompanyAccessType(id, data);
    },
    clientMatterUpdate: async (ctx) => {
      const { id, matter } = ctx.arguments;
      const data = {
        matter: matter,
        updatedAt: new Date().toISOString(),
      };
      return await updateClientMatter(id, data);
    },
    backgroundCreate: async (ctx) => {
      return await createBackground(ctx.arguments);
    },
    backgroundUpdate: async (ctx) => {
      const { id, description } = ctx.arguments;
      const data = {
        description: description,
        updatedAt: new Date().toISOString(),
      };
      return await updateBackground(id, data);
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
