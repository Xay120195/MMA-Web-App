const client = require("../../../lib/dynamodb-client");
const {
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4 } = require("uuid");

const { inviteUser, createUser } = require("../../../services/UserService");
const {
  createMatterFile,
  updateMatterFile,
} = require("../../../services/MatterService");

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
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "ClientsTable",
      Item: params,
    });
    const request = await client.send(command);

    const companyClientParams = {
      id: v4(),
      clientId: rawParams.id,
      companyId: data.companyId,
      createdAt: new Date().toISOString(),
    };

    const companyClientCommand = new PutItemCommand({
      TableName: "CompanyClientTable",
      Item: marshall(companyClientParams),
    });

    const companyClientRequest = await client.send(companyClientCommand);

    response = companyClientRequest ? rawParams : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

async function createLabel(data) {
  let response = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "LabelsTable",
      Item: params,
    });
    const request = await client.send(command);

    const clientMatterLabelParams = {
      id: v4(),
      labelId: rawParams.id,
      clientMatterId: data.clientMatterId,
      createdAt: new Date().toISOString(),
    };

    const clientMatterLabelCommand = new PutItemCommand({
      TableName: "ClientMatterLabelTable",
      Item: marshall(clientMatterLabelParams),
    });

    const clientMatterLabelRequest = await client.send(
      clientMatterLabelCommand
    );

    response = clientMatterLabelRequest ? rawParams : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

async function updateLabel(id, data) {
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
      TableName: "LabelsTable",
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

async function createClientMatter(data) {
  let response = {};
  try {
    const rawParams = {
      id: v4(),
      matter: data.matter,
      client: data.client,
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "ClientMatterTable",
      Item: params,
    });
    const request = await client.send(command);

    const companyClientMatterParams = {
      id: v4(),
      clientMatterId: rawParams.id,
      companyId: data.companyId,
      createdAt: new Date().toISOString(),
    };

    const companyClientMatterCommand = new PutItemCommand({
      TableName: "CompanyClientMatterTable",
      Item: marshall(companyClientMatterParams),
    });

    const companyClientMatterRequest = await client.send(
      companyClientMatterCommand
    );

    response = companyClientMatterRequest ? rawParams : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
}

async function createMatter(data) {
  let response = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "MatterTable",
      Item: params,
    });

    const request = await client.send(command);

    const companyMatterParams = {
      id: v4(),
      matterId: rawParams.id,
      companyId: data.companyId,
      createdAt: new Date().toISOString(),
    };

    const companyMatterCommand = new PutItemCommand({
      TableName: "CompanyMatterTable",
      Item: marshall(companyMatterParams),
    });

    const companyMatterRequest = await client.send(companyMatterCommand);

    response = companyMatterRequest ? rawParams : {};
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
      date: data.date,
      createdAt: new Date().toISOString(),
    };

    const params = marshall(rawParams);
    const command = new PutItemCommand({
      TableName: "BackgroundsTable",
      Item: params,
    });
    const request = await client.send(command);

    const clientMatterBackgroundParams = {
      id: v4(),
      backgroundId: rawParams.id,
      clientMatterId: data.clientMatterId,
      createdAt: new Date().toISOString(),
    };

    const clientMatterBackgroundCommand = new PutItemCommand({
      TableName: "ClientMatterBackgroundTable",
      Item: marshall(clientMatterBackgroundParams),
    });

    const clientMatterBackgroundRequest = await client.send(
      clientMatterBackgroundCommand
    );

    response = clientMatterBackgroundRequest ? rawParams : {};
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

    const command = new UpdateItemCommand({
      TableName: "BackgroundsTable",
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

export async function deleteBackground(id) {
  let response = {};
  try {
    const clientMatterBackgroundParams = {
      TableName: "ClientMatterBackgroundTable",
      IndexName: "byBackground",
      KeyConditionExpression: "backgroundId = :backgroundId",
      ExpressionAttributeValues: marshall({
        ":backgroundId": id,
      }),
    };

    const clientMatterBackgroundCommand = new QueryCommand(
      clientMatterBackgroundParams
    );
    const clientMatterBackgroundResult = await client.send(
      clientMatterBackgroundCommand
    );

    const clientMatterBackgroundId = clientMatterBackgroundResult.Items.map(
      (i) => i.id
    );

    const filterClientMatterBackgroundId = clientMatterBackgroundId[0];

    const deleateClientMatterBackgroundCommand = new DeleteItemCommand({
      TableName: "ClientMatterBackgroundTable",
      Key: { id: filterClientMatterBackgroundId },
    });

    const deleateClientMatterBackgroundResult = await client.send(
      deleateClientMatterBackgroundCommand
    );

    if (deleateClientMatterBackgroundResult) {
      const command = new DeleteItemCommand({
        TableName: "BackgroundsTable",
        Key: marshall({ id }),
      });
      const request = await client.send(command);

      response = request ? { id: id } : {};
    }
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
  }

  return response;
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
    matterFileUpdate: async (ctx) => {
      const { id, name, details, labels } = ctx.arguments;
      const data = {
        name: name,
        details: details,
        labels: labels,
        updatedAt: new Date().toISOString(),
      };
      return await updateMatterFile(id, data);
    },
    labelCreate: async (ctx) => {
      return await createLabel(ctx.arguments);
    },
    labelUpdate: async (ctx) => {
      const { id, name, description } = ctx.arguments;
      const data = {
        name: name,
        description: description,
        updatedAt: new Date().toISOString(),
      };
      return await updateLabel(id, data);
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
    clientMatterCreate: async (ctx) => {
      return await createClientMatter(ctx.arguments);
    },
    backgroundCreate: async (ctx) => {
      return await createBackground(ctx.arguments);
    },
    backgroundUpdate: async (ctx) => {
      const { id, date, description } = ctx.arguments;
      const data = {
        date: date,
        description: description,
        updatedAt: new Date().toISOString(),
      };
      return await updateBackground(id, data);
    },
    backgroundDelete: async (ctx) => {
      const { id } = ctx.arguments;
      return await deleteBackground(id);
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
