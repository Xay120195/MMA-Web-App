const client = require("../../../lib/dynamodb-client");
const {
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  BatchWriteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4 } = require("uuid");
const { inviteUser, createUser } = require("../../../services/UserService");
const {
  createMatterFile,
  updateMatterFile,
  softDeleteMatterFile,
  bulkUpdateMatterFileOrders,
} = require("../../../services/MatterService");

async function createCompany(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      representative: data.representative,
      createdAt: new Date().toISOString(),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "CompanyTable",
      Item: param,
    });

    const request = await client.send(cmd);
    resp = request ? unmarshall(param) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function createPage(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      label: data.label,
      route: data.route,
      features: data.features,
      createdAt: new Date().toISOString(),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "PageTable",
      Item: param,
    });

    const request = await client.send(cmd);
    resp = request ? unmarshall(param) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function createFeature(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      label: data.label,
      page: data.page,
      createdAt: new Date().toISOString(),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "FeatureTable",
      Item: param,
    });

    const request = await client.send(cmd);
    resp = request ? unmarshall(param) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function createUserColumnSettings(data) {
  let resp = {};
  try {
    const arrItems = [];

    for (var i = 0; i < data.columnSettings.length; i++) {
      arrItems.push({
        PutRequest: {
          Item: marshall({
            id: v4(),
            userId: data.userId,
            columnSettings: data.columnSettings[i],
            isVisible: true,
            createdAt: new Date().toISOString(),
          }),
        },
      });
    }

    const param = {
      RequestItems: {
        UserColumnSettingsTable: arrItems,
      },
    };

    const cmd = new BatchWriteItemCommand(param);
    const result = await client.send(cmd);

    resp = result ? data : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function createCompanyAccessType(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      companyId: data.companyId,
      userType: data.userType,
      access: data.access,
      createdAt: new Date().toISOString(),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "CompanyAccessTypeTable",
      Item: param,
    });

    const request = await client.send(cmd);
    resp = request ? unmarshall(param) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function updateCompanyAccessType(id, data) {
  let resp = {};
  try {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      UpdateExpression,
    } = getUpdateExpressions(data);

    const param = {
      id,
      ...data,
    };

    const cmd = new UpdateItemCommand({
      TableName: "CompanyAccessTypeTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });
    const request = await client.send(cmd);
    resp = request ? param : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function createClient(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      createdAt: new Date().toISOString(),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "ClientsTable",
      Item: param,
    });
    const request = await client.send(cmd);

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

    resp = companyClientRequest ? rawParams : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function createLabel(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      createdAt: new Date().toISOString(),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "LabelsTable",
      Item: param,
    });
    const request = await client.send(cmd);

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

    resp = clientMatterLabelRequest ? rawParams : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function tagFileLabel(data) {
  let resp = {};
  try {
    const arrItems = [];

    const fileLabelIdParams = {
      TableName: "FileLabelTable",
      IndexName: "byFile",
      KeyConditionExpression: "fileId = :fileId",
      ExpressionAttributeValues: marshall({
        ":fileId": data.file.id,
      }),
    };

    const fileLabelIdCommand = new QueryCommand(fileLabelIdParams);
    const fileLabelIdResult = await client.send(fileLabelIdCommand);

    for (var a = 0; a < fileLabelIdResult.Items.length; a++) {
      var fileLabelId = { id: fileLabelIdResult.Items[a].id };
      arrItems.push({
        DeleteRequest: {
          Key: fileLabelId,
        },
      });
    }

    for (var i = 0; i < data.label.length; i++) {
      arrItems.push({
        PutRequest: {
          Item: marshall({
            id: v4(),
            fileId: data.file.id,
            labelId: data.label[i].id,
          }),
        },
      });
    }

    const fileLabelParams = {
      RequestItems: {
        FileLabelTable: arrItems,
      },
    };

    const fileLabelCommand = new BatchWriteItemCommand(fileLabelParams);
    const fileLabelResult = await client.send(fileLabelCommand);

    resp = fileLabelResult ? { file: { id: data.file.id } } : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function tagBackgroundFile(data) {
  let resp = {};

  try {
    const arrItems = [];

    const backgroundFileIdParams = {
      TableName: "BackgroundFileTable",
      IndexName: "byBackground",
      KeyConditionExpression: "backgroundId = :backgroundId",
      ExpressionAttributeValues: marshall({
        ":backgroundId": data.backgroundId,
      }),
    };

    const backgroundFileIdCommand = new QueryCommand(backgroundFileIdParams);
    const backgroundFileIdResult = await client.send(backgroundFileIdCommand);

    for (var a = 0; a < backgroundFileIdResult.Items.length; a++) {
      var backgroundFileId = { id: backgroundFileIdResult.Items[a].id };
      arrItems.push({
        DeleteRequest: {
          Key: backgroundFileId,
        },
      });
    }

    for (var i = 0; i < data.files.length; i++) {
      arrItems.push({
        PutRequest: {
          Item: marshall({
            id: v4(),
            backgroundId: data.backgroundId,
            fileId: data.files[i].id,
          }),
        },
      });
    }

    const backgroundFileParams = {
      RequestItems: {
        BackgroundFileTable: arrItems,
      },
    };

    const backgroundFileCommand = new BatchWriteItemCommand(
      backgroundFileParams
    );
    const backgroundFileResult = await client.send(backgroundFileCommand);

    resp = backgroundFileResult ? { id: data.backgroundId } : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function tagUserColumnSettings(id, data) {
  let resp = {};
  try {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      UpdateExpression,
    } = getUpdateExpressions(data);

    const param = {
      id,
      ...data,
    };

    const cmd = new UpdateItemCommand({
      TableName: "LabelsTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });
    const request = await client.send(cmd);
    resp = request ? param : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function bulkDeleteBackground(data) {
  let resp = {};
  try {
    let backgroundId = data.id;
    const arrBackgroundItems = [];
    const arrCompanyBackgroundItems = [];
    const arrBackgroundIds = [];

    for (var a = 0; a < backgroundId.length; a++) {
      var bId = { id: backgroundId[a] };

      arrBackgroundIds.push(bId);

      arrBackgroundItems.push({
        DeleteRequest: {
          Key: marshall(bId),
        },
      });

      const companyBackgroundParams = {
        TableName: "ClientMatterBackgroundTable",
        IndexName: "byBackground",
        KeyConditionExpression: "backgroundId = :backgroundId",
        ExpressionAttributeValues: marshall({
          ":backgroundId": backgroundId[a],
        }),
      };

      const companyBackgroundCommand = new QueryCommand(
        companyBackgroundParams
      );
      const companyBackgroundResult = await client.send(
        companyBackgroundCommand
      );

      for (var b = 0; b < companyBackgroundResult.Items.length; b++) {
        var companyBackgroundId = { id: companyBackgroundResult.Items[b].id };
        arrCompanyBackgroundItems.push({
          DeleteRequest: {
            Key: companyBackgroundId,
          },
        });
      }
    }

    const backgroundParams = {
      RequestItems: {
        BackgroundsTable: arrBackgroundItems,
      },
    };

    const backgroundCommand = new BatchWriteItemCommand(backgroundParams);
    const backgroundResult = await client.send(backgroundCommand);

    if (backgroundResult) {
      const deleteCompanyBackgroundParams = {
        RequestItems: {
          ClientMatterBackgroundTable: arrCompanyBackgroundItems,
        },
      };

      const deleteCompanyBackgroundCommand = new BatchWriteItemCommand(
        deleteCompanyBackgroundParams
      );
      const deleteCompanyBackgroundResult = await client.send(
        deleteCompanyBackgroundCommand
      );

      resp = deleteCompanyBackgroundResult ? arrBackgroundIds : {};
    }
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function updateLabel(id, data) {
  let resp = {};
  try {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      UpdateExpression,
    } = getUpdateExpressions(data);

    const param = {
      id,
      ...data,
    };

    const cmd = new UpdateItemCommand({
      TableName: "LabelsTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });
    const request = await client.send(cmd);
    resp = request ? param : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function createClientMatter(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      matter: data.matter,
      client: data.client,
      createdAt: new Date().toISOString(),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "ClientMatterTable",
      Item: param,
    });
    const request = await client.send(cmd);

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

    resp = companyClientMatterRequest ? rawParams : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function createMatter(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      createdAt: new Date().toISOString(),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "MatterTable",
      Item: param,
    });

    const request = await client.send(cmd);

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

    resp = companyMatterRequest ? rawParams : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function createBackground(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      description: data.description,
      date: data.date,
      createdAt: new Date().toISOString(),
      order: 0,
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "BackgroundsTable",
      Item: param,
    });
    const request = await client.send(cmd);

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

    resp = clientMatterBackgroundRequest ? rawParams : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function createRFI(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      createdAt: new Date().toISOString(),
      order: 0,
    };

    console.log("rawParams", rawParams);

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "RFITable",
      Item: param,
    });
    const request = await client.send(cmd);

    const clientMatterRFIParams = {
      id: v4(),
      rfiId: rawParams.id,
      clientMatterId: data.clientMatterId,
      createdAt: new Date().toISOString(),
    };

    const clientMatterRFICommand = new PutItemCommand({
      TableName: "ClientMatterRFITable",
      Item: marshall(clientMatterRFIParams),
    });

    const clientMatterRFIRequest = await client.send(clientMatterRFICommand);

    resp = clientMatterRFIRequest ? rawParams : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function createColumnSettings(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      label: data.label,
      tableName: data.tableName,
      createdAt: new Date().toISOString(),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "ColumnSettingsTable",
      Item: param,
    });

    const request = await client.send(cmd);
    resp = request ? unmarshall(param) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function updateUserColumnSettings(id, data) {
  let resp = {};
  try {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      UpdateExpression,
    } = getUpdateExpressions(data);

    const param = {
      id,
      ...data,
    };

    const cmd = new UpdateItemCommand({
      TableName: "UserColumnSettingsTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });

    const request = await client.send(cmd);

    resp = request ? param : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function updateBackground(id, data) {
  let resp = {};
  try {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      UpdateExpression,
    } = getUpdateExpressions(data);

    const param = {
      id,
      ...data,
    };

    const cmd = new UpdateItemCommand({
      TableName: "BackgroundsTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });

    const request = await client.send(cmd);

    resp = request ? param : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function bulkUpdateBackgroundOrders(data) {
  let resp = [];
  try {
    data.map(async (items) => {
      const id = items.id;
      const arrangement = items;
      delete arrangement.id;

      resp.push({
        id,
        ...items,
      });

      const {
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        UpdateExpression,
      } = getUpdateExpressions(arrangement);

      const cmd = new UpdateItemCommand({
        TableName: "BackgroundsTable",
        Key: marshall({ id }),
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
      });

      await client.send(cmd);
    });
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
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
  let resp = {};
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

    const deleteClientMatterBackgroundCommand = new DeleteItemCommand({
      TableName: "ClientMatterBackgroundTable",
      Key: { id: filterClientMatterBackgroundId },
    });

    const deleteClientMatterBackgroundResult = await client.send(
      deleteClientMatterBackgroundCommand
    );

    if (deleteClientMatterBackgroundResult) {
      const cmd = new DeleteItemCommand({
        TableName: "BackgroundsTable",
        Key: marshall({ id }),
      });
      const request = await client.send(cmd);

      resp = request ? { id: id } : {};
    }
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

export async function deleteClientMatter(id) {
  let resp = {};

  try {
    const companyClientMatterParams = {
      TableName: "CompanyClientMatterTable",
      IndexName: "byClientMatter",
      KeyConditionExpression: "clientMatterId = :clientMatterId",
      ExpressionAttributeValues: marshall({
        ":clientMatterId": id,
      }),
    };

    const companyClientMatterCommand = new QueryCommand(
      companyClientMatterParams
    );
    const companyClientMatterResult = await client.send(
      companyClientMatterCommand
    );

    const companyClientMatterId = companyClientMatterResult.Items.map(
      (i) => i.id
    );

    const filterCompanyClientMatterId = companyClientMatterId[0];

    const deleteCompanyClientMatterCommand = new DeleteItemCommand({
      TableName: "CompanyClientMatterTable",
      Key: { id: filterCompanyClientMatterId },
    });

    const deleteCompanyClientMatterResult = await client.send(
      deleteCompanyClientMatterCommand
    );

    if (deleteCompanyClientMatterResult) {
      const cmd = new DeleteItemCommand({
        TableName: "ClientMatterTable",
        Key: marshall({ id }),
      });
      const request = await client.send(cmd);

      resp = request ? { id: id } : {};
    }
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
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
      const { id, name, details, order, date } = ctx.arguments;

      const data = {
        updatedAt: new Date().toISOString(),
      };

      if (name !== undefined) data.name = name;

      if (details !== undefined) data.details = details;

      if (order !== undefined) data.order = order;

      if (date !== undefined) data.date = date;

      return await updateMatterFile(id, data);
    },

    matterFileBulkUpdateOrders: async (ctx) => {
      const { arrangement } = ctx.arguments; // id and order

      const data = arrangement.map((item) => {
        return { ...item, updatedAt: new Date().toISOString() };
      });
      return await bulkUpdateMatterFileOrders(data);
    },

    matterFileSoftDelete: async (ctx) => {
      const { id } = ctx.arguments;
      const data = {
        updatedAt: new Date().toISOString(),
        isDeleted: true,
      };

      return await softDeleteMatterFile(id, data);
    },
    labelCreate: async (ctx) => {
      return await createLabel(ctx.arguments);
    },
    fileLabelTag: async (ctx) => {
      return await tagFileLabel(ctx.arguments);
    },
    labelUpdate: async (ctx) => {
      const { id, name, description } = ctx.arguments;
      const data = {
        updatedAt: new Date().toISOString(),
      };

      if (name !== undefined) data.name = name;

      if (description !== undefined) data.description = description;

      return await updateLabel(id, data);
    },
    companyAccessTypeCreate: async (ctx) => {
      return await createCompanyAccessType(ctx.arguments);
    },
    companyAccessTypeUpdate: async (ctx) => {
      const { id, access } = ctx.arguments;
      const data = {
        updatedAt: new Date().toISOString(),
      };

      if (access !== undefined) data.access = access;

      return await updateCompanyAccessType(id, data);
    },
    clientMatterCreate: async (ctx) => {
      return await createClientMatter(ctx.arguments);
    },
    clientMatterDelete: async (ctx) => {
      const { id } = ctx.arguments;
      return await deleteClientMatter(id);
    },
    backgroundCreate: async (ctx) => {
      return await createBackground(ctx.arguments);
    },
    backgroundUpdate: async (ctx) => {
      const { id, date, description, order } = ctx.arguments;
      const data = {
        updatedAt: new Date().toISOString(),
      };

      if (date !== undefined) data.date = date;

      if (description !== undefined) data.description = description;

      if (order !== undefined) data.order = order;

      return await updateBackground(id, data);
    },

    backgroundBulkUpdateOrders: async (ctx) => {
      const { arrangement } = ctx.arguments; // id and order

      const data = arrangement.map((item) => {
        return { ...item, updatedAt: new Date().toISOString() };
      });
      return await bulkUpdateBackgroundOrders(data);
    },

    backgroundDelete: async (ctx) => {
      const { id } = ctx.arguments;
      return await deleteBackground(id);
    },
    backgroundBulkDelete: async (ctx) => {
      return await bulkDeleteBackground(ctx.arguments);
    },
    backgroundFileTag: async (ctx) => {
      return await tagBackgroundFile(ctx.arguments);
    },
    columnSettingsCreate: async (ctx) => {
      return await createColumnSettings(ctx.arguments);
    },
    userColumnSettingsTag: async (ctx) => {
      return await tagUserColumnSettings(ctx.arguments);
    },

    userColumnSettingsCreate: async (ctx) => {
      return await createUserColumnSettings(ctx.arguments);
    },
    userColumnSettingsUpdate: async (ctx) => {
      const { id, isVisible } = ctx.arguments;
      const data = {
        updatedAt: new Date().toISOString(),
      };

      if (isVisible !== undefined) data.isVisible = isVisible;

      return await updateUserColumnSettings(id, data);
    },
    rfiCreate: async (ctx) => {
      return await createRFI(ctx.arguments);
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
