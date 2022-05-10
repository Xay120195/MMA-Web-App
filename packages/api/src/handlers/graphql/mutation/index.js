const ddbClient = require("../../../lib/dynamodb-client");
const {
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  BatchWriteItemCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4 } = require("uuid");
const { inviteUser, createUser } = require("../../../services/UserService");
const {
  createMatterFile,
  updateMatterFile,
  softDeleteMatterFile,
  bulkUpdateMatterFileOrders,
  bulkCreateMatterFile,
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

    const request = await ddbClient.send(cmd);
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

    const request = await ddbClient.send(cmd);
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

    const request = await ddbClient.send(cmd);
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
    const result = await ddbClient.send(cmd);

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

    const request = await ddbClient.send(cmd);
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
    const request = await ddbClient.send(cmd);
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
    const request = await ddbClient.send(cmd);

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

    const companyClientRequest = await ddbClient.send(companyClientCommand);

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
    const request = await ddbClient.send(cmd);

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

    const clientMatterLabelRequest = await ddbClient.send(
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

    const fileLabelIdCmd = new QueryCommand(fileLabelIdParams);
    const fileLabelIdRes = await ddbClient.send(fileLabelIdCmd);

    for (var a = 0; a < fileLabelIdRes.Items.length; a++) {
      var fileLabelId = { id: fileLabelIdRes.Items[a].id };
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

    let batches = [],
      current_batch = [],
      item_count = 0;

    arrItems.forEach((data) => {
      item_count++;
      current_batch.push(data);

      // Chunk items to 25
      if (item_count % 25 == 0) {
        batches.push(current_batch);
        current_batch = [];
      }
    });

    // Add the last batch if it has records and is not equal to 25
    if (current_batch.length > 0 && current_batch.length != 25) {
      batches.push(current_batch);
    }

    batches.forEach(async (data) => {
      const fileLabelParams = {
        RequestItems: {
          FileLabelTable: data,
        },
      };

      const fileLabelCmd = new BatchWriteItemCommand(fileLabelParams);
      await ddbClient.send(fileLabelCmd);
    });

    resp = { file: { id: data.file.id } };
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

    const backgroundFileIdCmd = new QueryCommand(backgroundFileIdParams);
    const backgroundFileIdRes = await ddbClient.send(backgroundFileIdCmd);

    for (var a = 0; a < backgroundFileIdRes.Items.length; a++) {
      var backgroundFileId = { id: backgroundFileIdRes.Items[a].id };
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

    let batches = [],
      current_batch = [],
      item_count = 0;

    arrItems.forEach((data) => {
      item_count++;
      current_batch.push(data);

      // Chunk items to 25
      if (item_count % 25 == 0) {
        batches.push(current_batch);
        current_batch = [];
      }
    });

    // Add the last batch if it has records and is not equal to 25
    if (current_batch.length > 0 && current_batch.length != 25) {
      batches.push(current_batch);
    }

    batches.forEach(async (data) => {
      const backgroundFileParams = {
        RequestItems: {
          BackgroundFileTable: data,
        },
      };

      const backgroundFileCmd = new BatchWriteItemCommand(backgroundFileParams);
      await ddbClient.send(backgroundFileCmd);
    });
    resp = { id: data.backgroundId };
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
    const request = await ddbClient.send(cmd);
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
    const arrCompBackgroundItems = [];
    const arrBackgroundIds = [];

    for (var a = 0; a < backgroundId.length; a++) {
      var bId = { id: backgroundId[a] };

      arrBackgroundIds.push(bId);

      arrBackgroundItems.push({
        DeleteRequest: {
          Key: marshall(bId),
        },
      });

      const compBackgroundParams = {
        TableName: "ClientMatterBackgroundTable",
        IndexName: "byBackground",
        KeyConditionExpression: "backgroundId = :backgroundId",
        ExpressionAttributeValues: marshall({
          ":backgroundId": backgroundId[a],
        }),
      };

      const compBackgroundCmd = new QueryCommand(compBackgroundParams);
      const compBackgroundRes = await ddbClient.send(compBackgroundCmd);

      for (var b = 0; b < compBackgroundRes.Items.length; b++) {
        var compBackgroundId = { id: compBackgroundRes.Items[b].id };
        arrCompBackgroundItems.push({
          DeleteRequest: {
            Key: compBackgroundId,
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
    const backgroundResult = await ddbClient.send(backgroundCommand);

    if (backgroundResult) {
      const deleteCompBackgroundParams = {
        RequestItems: {
          ClientMatterBackgroundTable: arrCompBackgroundItems,
        },
      };

      const deleteCompBackgroundCmd = new BatchWriteItemCommand(
        deleteCompBackgroundParams
      );
      const deleteCompBackgroundRes = await ddbClient.send(
        deleteCompBackgroundCmd
      );

      resp = deleteCompBackgroundRes ? arrBackgroundIds : {};
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
    const request = await ddbClient.send(cmd);
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
    const request = await ddbClient.send(cmd);

    const companyClientMatterParams = {
      id: v4(),
      clientMatterId: rawParams.id,
      companyId: data.companyId,
      createdAt: new Date().toISOString(),
    };

    const companyClientMatterCmd = new PutItemCommand({
      TableName: "CompanyClientMatterTable",
      Item: marshall(companyClientMatterParams),
    });

    const companyClientMatterRes = await ddbClient.send(companyClientMatterCmd);

    resp = companyClientMatterRes ? rawParams : {};
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

    const request = await ddbClient.send(cmd);

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

    const companyMatterRequest = await ddbClient.send(companyMatterCommand);

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
      order: data.order ? data.order : 0,
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "BackgroundsTable",
      Item: param,
    });
    const request = await ddbClient.send(cmd);

    // const clientMatterBackgroundParams = {
    //   id: v4(),
    //   backgroundId: rawParams.id,
    //   clientMatterId: data.clientMatterId,
    //   createdAt: new Date().toISOString(),
    // };

    // const clientMatterBackgroundCmd = new PutItemCommand({
    //   TableName: "ClientMatterBackgroundTable",
    //   Item: marshall(clientMatterBackgroundParams),
    // });

    // await ddbClient.send(clientMatterBackgroundCmd);

    const briefBackgroundParams = {
      id: v4(),
      backgroundId: rawParams.id,
      briefId: data.briefId,
      createdAt: new Date().toISOString(),
      order: data.order ? data.order : 0,
    };

    const briefBackgroundCmd = new PutItemCommand({
      TableName: "BriefBackgroundTable",
      Item: marshall(briefBackgroundParams),
    });

    await ddbClient.send(briefBackgroundCmd);

    resp = rawParams;
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

export async function tagBriefBackground(data) {
  console.log("tagBriefBackground", data);

  let resp = {};
  try {
    const arrItems = [],
      arrIDs = [];

    for (var i = 0; i < data.background.length; i++) {
      var uuid = v4();
      arrItems.push({
        PutRequest: {
          Item: marshall({
            id: uuid,
            briefId: data.briefId,
            backgroundId: data.background[i].id,
            order: data.background[i].order,
            createdAt: new Date().toISOString(),
          }),
        },
      });

      arrIDs.push({
        id: uuid,
      });
    }

    console.log("put request: ", JSON.stringify(arrItems));

    let batches = [],
      current_batch = [],
      item_count = 0;

    arrItems.forEach((data) => {
      item_count++;
      current_batch.push(data);

      // Chunk items to 25
      if (item_count % 25 == 0) {
        batches.push(current_batch);
        current_batch = [];
      }
    });

    // Add the last batch if it has records and is not equal to 25
    if (current_batch.length > 0 && current_batch.length != 25) {
      batches.push(current_batch);
    }

    batches.forEach(async (data, index) => {
      const briefBackgroundParams = {
        RequestItems: {
          BriefBackgroundTable: data,
        },
      };

      const briefBackgroundCmd = new BatchWriteItemCommand(
        briefBackgroundParams
      );
      const request = await ddbClient.send(briefBackgroundCmd);
      console.log("Execute: ", index, request);
    });

    resp = arrIDs;
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
      order: data.order ? data.order : 0,
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "RFITable",
      Item: param,
    });
    const request = await ddbClient.send(cmd);

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

    const clientMatterRFIRequest = await ddbClient.send(clientMatterRFICommand);

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

async function createBrief(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      date: data.date,
      createdAt: new Date().toISOString(),
      order: data.order ? data.order : 0,
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "BriefTable",
      Item: param,
    });
    const request = await ddbClient.send(cmd);
    const clientMatterBriefParams = {
      id: v4(),
      briefId: rawParams.id,
      clientMatterId: data.clientMatterId,
      createdAt: new Date().toISOString(),
    };

    const clientMatterBriefCommand = new PutItemCommand({
      TableName: "ClientMatterBriefTable",
      Item: marshall(clientMatterBriefParams),
    });

    const clientMatterBriefRequest = await ddbClient.send(
      clientMatterBriefCommand
    );

    resp = clientMatterBriefRequest ? rawParams : {};
    resp = request ? rawParams : {};
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

    const request = await ddbClient.send(cmd);
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

    const request = await ddbClient.send(cmd);

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

    const request = await ddbClient.send(cmd);

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

async function updateBrief(id, data) {
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
      TableName: "BriefTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });

    const request = await ddbClient.send(cmd);

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
    const asyncResult = await Promise.all(
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

        await ddbClient.send(cmd);
      })
    );
    resp = asyncResult;
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function bulkInitializeBackgroundOrders(clientMatterId) {
  let resp = [];

  try {
    const cmBackgroundsParam = {
      TableName: "ClientMatterBackgroundTable",
      IndexName: "byCreatedAt",
      KeyConditionExpression: "clientMatterId = :clientMatterId",
      ExpressionAttributeValues: marshall({
        ":clientMatterId": clientMatterId,
      }),
      ProjectionExpression: "backgroundId",
      ScanIndexForward: true,
    };

    const cmBackgroundsCmd = new QueryCommand(cmBackgroundsParam);
    const cmBackgroundsResult = await ddbClient.send(cmBackgroundsCmd);

    const backgroundIds = cmBackgroundsResult.Items.map((i) =>
      unmarshall(i)
    ).map((f) => marshall({ id: f.backgroundId }));

    if (backgroundIds.length !== 0) {
      let batches = [],
        current_batch = [],
        item_count = 0;

      backgroundIds.filter(function (item, i, ar) {
        return ar.indexOf(item) === i;
      });

      backgroundIds.forEach((data) => {
        item_count++;
        current_batch.push(data);

        // Chunk items to 25
        if (item_count % 25 == 0) {
          batches.push(current_batch);
          current_batch = [];
        }
      });

      if (current_batch.length > 0 && current_batch.length != 25) {
        batches.push(current_batch);
      }

      const asyncBackgroundsResult = await Promise.all(
        batches.map(async (data) => {
          const backgroundsParam = {
            RequestItems: {
              BackgroundsTable: {
                Keys: data,
                ExpressionAttributeNames: {
                  "#order": "order",
                },
                ProjectionExpression: "id, #order",
              },
            },
          };

          const backgroundsCommand = new BatchGetItemCommand(backgroundsParam);
          const backgroundsResult = await ddbClient.send(backgroundsCommand);

          return backgroundsResult.Responses.BackgroundsTable.map((i) =>
            unmarshall(i)
          );
        })
      );

      let objBackgrounds = [].concat.apply([], asyncBackgroundsResult);

      objBackgrounds.sort(function (a, b) {
        return a.order < b.order ? -1 : 1; // ? -1 : 1 for ascending/increasing order
      });

      const arrangement = objBackgrounds.map((data, index) => {
        return {
          id: data.id,
          order: index + 1,
        };
      });

      return await bulkUpdateBackgroundOrders(arrangement);
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

async function bulkInitializeMatterFileOrders(clientMatterId) {
  let resp = [];
  try {
    const matterFileParam = {
      TableName: "MatterFileTable",
      IndexName: "byCreatedAt",
      KeyConditionExpression: "matterId = :matterId",
      FilterExpression: "isDeleted = :isDeleted",
      ExpressionAttributeValues: marshall({
        ":matterId": clientMatterId,
        ":isDeleted": false,
      }),
      ScanIndexForward: true,
    };

    const matterFileCmd = new QueryCommand(matterFileParam);
    const matterFileResult = await ddbClient.send(matterFileCmd);

    const objMatterFiles = matterFileResult.Items.map((d) => unmarshall(d));

    if (objMatterFiles.length !== 0) {
      objMatterFiles.sort(function (a, b) {
        return a.order < b.order ? -1 : 1; // ? -1 : 1 for ascending/increasing order
      });

      const arrangement = objMatterFiles.map((data, index) => {
        return {
          id: data.id,
          order: index + 1,
        };
      });

      return await bulkUpdateMatterFileOrders(arrangement);
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
      ProjectionExpression: "id",
    };

    const clientMatterBackgroundCmd = new QueryCommand(
      clientMatterBackgroundParams
    );
    const clientMatterBackgroundResult = await ddbClient.send(
      clientMatterBackgroundCmd
    );

    const clientMatterBackgroundId = clientMatterBackgroundResult.Items[0];

    const deleteClientMatterBackgroundCommand = new DeleteItemCommand({
      TableName: "ClientMatterBackgroundTable",
      Key: clientMatterBackgroundId,
    });

    const deleteClientMatterBackgroundResult = await ddbClient.send(
      deleteClientMatterBackgroundCommand
    );

    if (deleteClientMatterBackgroundResult) {
      const cmd = new DeleteItemCommand({
        TableName: "BackgroundsTable",
        Key: marshall({ id }),
      });
      const request = await ddbClient.send(cmd);

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

export async function deleteBrief(id) {
  let resp = {};
  try {
    const clientMatterBriefParams = {
      TableName: "ClientMatterBriefTable",
      IndexName: "byBrief",
      KeyConditionExpression: "briefId = :briefId",
      ExpressionAttributeValues: marshall({
        ":briefId": id,
      }),
      ProjectionExpression: "id", // fetch id of ClientMatterBriefTable only
    };

    const clientMatterBriefCmd = new QueryCommand(clientMatterBriefParams);
    const clientMatterBriefResult = await ddbClient.send(clientMatterBriefCmd);

    const clientMatterBriefId = clientMatterBriefResult.Items[0];

    const deleteClientMatterBriefCommand = new DeleteItemCommand({
      TableName: "ClientMatterBriefTable",
      Key: clientMatterBriefId,
    });

    const deleteClientMatterBriefResult = await ddbClient.send(
      deleteClientMatterBriefCommand
    );

    if (deleteClientMatterBriefResult) {
      const cmd = new DeleteItemCommand({
        TableName: "BriefTable",
        Key: marshall({ id }),
      });
      const request = await ddbClient.send(cmd);

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
      ProjectionExpression: "id",
    };

    const companyClientMatterCmd = new QueryCommand(companyClientMatterParams);
    const companyClientMatterResult = await ddbClient.send(
      companyClientMatterCmd
    );

    const companyClientMatterId = companyClientMatterResult.Items[0];

    const deleteCompanyClientMatterCommand = new DeleteItemCommand({
      TableName: "CompanyClientMatterTable",
      Key: companyClientMatterId,
    });

    const deleteCompanyClientMatterResult = await ddbClient.send(
      deleteCompanyClientMatterCommand
    );

    if (deleteCompanyClientMatterResult) {
      const cmd = new DeleteItemCommand({
        TableName: "ClientMatterTable",
        Key: marshall({ id }),
      });
      const request = await ddbClient.send(cmd);

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

    matterFileBulkCreate: async (ctx) => {
      const { files } = ctx.arguments;
      return await bulkCreateMatterFile(files);
    },

    matterFileBulkUpdateOrders: async (ctx) => {
      const { arrangement } = ctx.arguments; // id and order
      return await bulkUpdateMatterFileOrders(arrangement);
    },

    matterFileBulkInitializeOrders: async (ctx) => {
      const { clientMatterId } = ctx.arguments; // id and order
      return await bulkInitializeMatterFileOrders(clientMatterId);
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

    briefBackgroundTag: async (ctx) => {
      return await tagBriefBackground(ctx.arguments);
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
      return await bulkUpdateBackgroundOrders(arrangement);
    },

    backgroundBulkInitializeOrders: async (ctx) => {
      const { clientMatterId } = ctx.arguments; // id and order
      return await bulkInitializeBackgroundOrders(clientMatterId);
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
    briefCreate: async (ctx) => {
      return await createBrief(ctx.arguments);
    },
    briefUpdate: async (ctx) => {
      const { id, date, name, order } = ctx.arguments;
      const data = {
        updatedAt: new Date().toISOString(),
      };

      if (date !== undefined) data.date = date;

      if (name !== undefined) data.name = name;

      if (order !== undefined) data.order = order;

      return await updateBrief(id, data);
    },
    briefDelete: async (ctx) => {
      const { id } = ctx.arguments;
      return await deleteBrief(id);
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
