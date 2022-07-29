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
const {
  inviteUser,
  createUser,
  deleteUser,
  updateUser,
} = require("../../../services/UserService");
const { toUTC, toLocalTime } = require("../../../shared/toUTC");
const {
  createMatterFile,
  updateMatterFile,
  softDeleteMatterFile,
  bulkUpdateMatterFileOrders,
  bulkCreateMatterFile,
  bulkSoftDeleteMatterFile,
} = require("../../../services/MatterService");
import { addToken } from "../../../services/gmail/addToken";
import { google } from "googleapis";
const { client_id, client_secret } = require("../../../services/gmail/config");

const googleAuth = new google.auth.OAuth2(
  client_id,
  client_secret,
  process.env.IS_OFFLINE
    ? "http://localhost:3000"
    : process.env.REACT_APP_GMAIL_REDIRECT_URI
);

async function createCompany(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      representative: data.representative,
      createdAt: toUTC(new Date()),
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
      createdAt: toUTC(new Date()),
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
      createdAt: toUTC(new Date()),
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

async function createCustomUserType(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      createdAt: toUTC(new Date()),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "CustomUserTypeTable",
      Item: param,
    });

    const request = await ddbClient.send(cmd);

    if (request) {
      const companyClientParams = {
        id: v4(),
        customUserTypeId: rawParams.id,
        companyId: data.companyId,
        createdAt: toUTC(new Date()),
      };

      const companyClientCommand = new PutItemCommand({
        TableName: "CompanyCustomUserTypeTable",
        Item: marshall(companyClientParams),
      });

      const companyClientRequest = await ddbClient.send(companyClientCommand);
      resp = companyClientRequest
        ? {
            ...rawParams,
            companyId: data.companyId,
          }
        : {};
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
            createdAt: toUTC(new Date()),
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
      createdAt: toUTC(new Date()),
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
      createdAt: toUTC(new Date()),
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
      createdAt: toUTC(new Date()),
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
      createdAt: toUTC(new Date()),
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
      createdAt: toUTC(new Date()),
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

async function bulkCreateLabel(clientMatterId, labels) {
  let resp = {};
  try {
    const arrItems = [],
      arrClientMatterLabels = [];

    for (var i = 0; i < labels.length; i++) {
      const labelId = v4();
      arrItems.push({
        PutRequest: {
          Item: marshall({
            id: labelId,
            name: labels[i].name,
            createdAt: toUTC(new Date()),
          }),
        },
      });

      arrClientMatterLabels.push({
        PutRequest: {
          Item: marshall({
            id: v4(),
            labelId: labelId,
            clientMatterId: clientMatterId,
            createdAt: toUTC(new Date()),
          }),
        },
      });
    }

    const labelParams = {
      RequestItems: {
        LabelsTable: arrItems,
      },
    };

    const labelCmd = new BatchWriteItemCommand(labelParams);
    const labelRes = await ddbClient.send(labelCmd);

    if (labelRes) {
      const clientMatterLabelParams = {
        RequestItems: {
          ClientMatterLabelTable: arrClientMatterLabels,
        },
      };

      const clientMatterLabelCmd = new BatchWriteItemCommand(
        clientMatterLabelParams
      );
      const clientMatterLabelRes = await ddbClient.send(clientMatterLabelCmd);

      if (clientMatterLabelRes) {
        resp = arrItems.map((i) => {
          return unmarshall(i.PutRequest.Item);
        });
      }
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
    let backgroundIds = data.id;
    const arrBackgroundItems = [];
    const arrBriefBackgroundItems = [];
    const arrBackgroundIds = [];

    for (var a = 0; a < backgroundIds.length; a++) {
      var bId = { id: backgroundIds[a] };

      arrBackgroundIds.push(bId);

      arrBackgroundItems.push({
        DeleteRequest: {
          Key: marshall(bId),
        },
      });

      const briefBackgroundParams = {
        TableName: "BriefBackgroundTable",
        IndexName: "byBackground",
        KeyConditionExpression: "backgroundId = :backgroundId",
        ExpressionAttributeValues: marshall({
          ":backgroundId": backgroundIds[a],
        }),
        ProjectionExpression: "id",
      };

      const briefBackgroundCmd = new QueryCommand(briefBackgroundParams);
      const briefBackgroundRes = await ddbClient.send(briefBackgroundCmd);

      for (var b = 0; b < briefBackgroundRes.Items.length; b++) {
        var briefBackgroundId = { id: briefBackgroundRes.Items[b].id };
        arrBriefBackgroundItems.push({
          DeleteRequest: {
            Key: briefBackgroundId,
          },
        });
      }
    }

    const bb_batches = [];
    let bb_current_batch = [],
      bb_item_count = 0;

    arrBriefBackgroundItems.forEach((data) => {
      bb_item_count++;
      bb_current_batch.push(data);

      if (bb_item_count % 25 == 0) {
        bb_batches.push(bb_current_batch);
        bb_current_batch = [];
      }
    });

    if (bb_current_batch.length > 0 && bb_current_batch.length != 25) {
      bb_batches.push(bb_current_batch);
    }

    const asyncDeleteBBResult = await Promise.all(
      bb_batches.map(async (data) => {
        const delBriefBackgroundParams = {
          RequestItems: {
            BriefBackgroundTable: data,
          },
        };

        const delBriefBackgroundCmd = new BatchWriteItemCommand(
          delBriefBackgroundParams
        );
        return await ddbClient.send(delBriefBackgroundCmd);
      })
    );

    if (asyncDeleteBBResult) {
      const b_batches = [];
      let b_current_batch = [],
        b_item_count = 0;

      arrBackgroundItems.forEach((data) => {
        b_item_count++;
        b_current_batch.push(data);

        if (b_item_count % 25 == 0) {
          b_batches.push(b_current_batch);
          b_current_batch = [];
        }
      });

      if (b_current_batch.length > 0 && b_current_batch.length != 25) {
        b_batches.push(b_current_batch);
      }

      const asyncDeleteBResult = await Promise.all(
        b_batches.map(async (data) => {
          const delBackgroundParams = {
            RequestItems: {
              BackgroundsTable: data,
            },
          };

          const delBackgroundCmd = new BatchWriteItemCommand(
            delBackgroundParams
          );
          return await ddbClient.send(delBackgroundCmd);
        })
      );

      resp = asyncDeleteBResult ? arrBackgroundIds : {};
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
      createdAt: toUTC(new Date()),
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
      createdAt: toUTC(new Date()),
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
      createdAt: toUTC(new Date()),
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
      createdAt: toUTC(new Date()),
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
      date: data.date ? data.date : null,
      createdAt: toUTC(new Date()),
      order: data.order ? data.order : 0,
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "BackgroundsTable",
      Item: param,
    });
    const request = await ddbClient.send(cmd);

    if (request) {
      const briefBackgroundParams = {
        id: v4(),
        backgroundId: rawParams.id,
        briefId: data.briefId,
        createdAt: toUTC(new Date()),
        order: data.order ? data.order : 0,
      };

      const briefBackgroundCmd = new PutItemCommand({
        TableName: "BriefBackgroundTable",
        Item: marshall(briefBackgroundParams),
      });

      await ddbClient.send(briefBackgroundCmd);
    }

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

async function bulkCreateBackground(briefId, data) {
  let resp = {};
  try {
    const arrBackgroundItems = [],
      arrBriefBackgroundItems = [];

    for (var i = 0; i < data.length; i++) {
      var backgroundParams = {
        id: v4(),
        description: data[i].description,
        date: data[i].date ? data[i].date : null,
        order: data[i].order ? data[i].order : 0,
        createdAt: toUTC(new Date()),
      };

      var briefBackgroundParams = {
        id: v4(),
        backgroundId: backgroundParams.id,
        briefId: briefId,
        createdAt: toUTC(new Date()),
        order: backgroundParams.order,
      };

      arrBackgroundItems.push({
        PutRequest: {
          Item: marshall(backgroundParams),
        },
      });

      arrBriefBackgroundItems.push({
        PutRequest: {
          Item: marshall(briefBackgroundParams),
        },
      });
    }

    const bb_batches = [];
    let bb_current_batch = [],
      bb_item_count = 0;

    arrBriefBackgroundItems.forEach((data) => {
      bb_item_count++;
      bb_current_batch.push(data);

      if (bb_item_count % 25 == 0) {
        bb_batches.push(bb_current_batch);
        bb_current_batch = [];
      }
    });

    if (bb_current_batch.length > 0 && bb_current_batch.length != 25) {
      bb_batches.push(bb_current_batch);
    }

    const asyncCreateBBResult = await Promise.all(
      bb_batches.map(async (data) => {
        const createBriefBackgroundParams = {
          RequestItems: {
            BriefBackgroundTable: data,
          },
        };

        const createBriefBackgroundCmd = new BatchWriteItemCommand(
          createBriefBackgroundParams
        );
        return await ddbClient.send(createBriefBackgroundCmd);
      })
    );

    if (asyncCreateBBResult) {
      const b_batches = [];
      let b_current_batch = [],
        b_item_count = 0;

      arrBackgroundItems.forEach((data) => {
        b_item_count++;
        b_current_batch.push(data);

        if (b_item_count % 25 == 0) {
          b_batches.push(b_current_batch);
          b_current_batch = [];
        }
      });

      if (b_current_batch.length > 0 && b_current_batch.length != 25) {
        b_batches.push(b_current_batch);
      }

      const asyncCreateBResult = await Promise.all(
        b_batches.map(async (data) => {
          const createBackgroundParams = {
            RequestItems: {
              BackgroundsTable: data,
            },
          };

          const createBackgroundCmd = new BatchWriteItemCommand(
            createBackgroundParams
          );
          return await ddbClient.send(createBackgroundCmd);
        })
      );

      resp = asyncCreateBResult
        ? arrBackgroundItems.map((i) => {
            return unmarshall(i.PutRequest.Item);
          })
        : [];
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

async function tagBriefBackground(data) {
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
            createdAt: toUTC(new Date()),
          }),
        },
      });

      arrIDs.push({
        id: uuid,
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

async function untagBriefBackground(data) {
  let resp = {};
  try {
    const arrItems = [];
    const backgroundIDs = data.background.map((i) => i.id);
    const briefBackgroundParams = {
      TableName: "BriefBackgroundTable",
      IndexName: "byBrief",
      KeyConditionExpression: "briefId = :briefId",
      ExpressionAttributeValues: marshall({
        ":briefId": data.briefId,
      }),
      ProjectionExpression: "id, backgroundId",
    };

    const briefBackgroundCmd = new QueryCommand(briefBackgroundParams);
    const briefBackgroundResult = await ddbClient.send(briefBackgroundCmd);

    const filterBriefBackgroundResult = briefBackgroundResult.Items.map((i) =>
      unmarshall(i)
    ).filter((b) => {
      return backgroundIDs.includes(b.backgroundId);
    });

    for (var a = 0; a < filterBriefBackgroundResult.length; a++) {
      var briefBackgroundId = { id: filterBriefBackgroundResult[a].id };
      arrItems.push({
        DeleteRequest: {
          Key: marshall(briefBackgroundId),
        },
      });
    }

    const batches = [];
    let current_batch = [],
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

    const asyncRemoveConection = await Promise.all(
      batches.map(async (data) => {
        const untagBriefBackgroundParams = {
          RequestItems: {
            BriefBackgroundTable: data,
          },
        };

        const untagBriefBackgroundCmd = new BatchWriteItemCommand(
          untagBriefBackgroundParams
        );
        return await ddbClient.send(untagBriefBackgroundCmd);
      })
    );

    if (asyncRemoveConection) {
      resp = { id: data.briefId };
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

async function createRFI(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      createdAt: toUTC(new Date()),
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
      createdAt: toUTC(new Date()),
      isDeleted: false,
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

async function createRequest(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      question: data.question,
      answer: data.answer,
      createdAt: toUTC(new Date()),
      order: data.order ? data.order : 0,
      itemNo: data.itemNo,
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "RequestTable",
      Item: param,
    });
    const req = await ddbClient.send(cmd);

    const rfiRequestParams = {
      id: v4(),
      requestId: rawParams.id,
      rfiId: data.rfiId,
      createdAt: toUTC(new Date()),
    };

    const rfiRequestCmd = new PutItemCommand({
      TableName: "RFIRequestTable",
      Item: marshall(rfiRequestParams),
    });

    const rfiRequestReq = await ddbClient.send(rfiRequestCmd);

    resp = rfiRequestReq ? rawParams : {};
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
      date: data.date ? data.date : null,
      createdAt: toUTC(new Date()),
      isDeleted: false,
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
      createdAt: toUTC(new Date()),
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
      createdAt: toUTC(new Date()),
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

async function updateRequest(id, data) {
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
      TableName: "RequestTable",
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

async function updateRFI(id, data) {
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
      TableName: "RFITable",
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
        const background_id = items.id;
        const arrangement = items;
        delete arrangement.id;

        const briefBackgroundParams = {
          TableName: "BriefBackgroundTable",
          IndexName: "byBackground",
          KeyConditionExpression: "backgroundId = :backgroundId",
          ExpressionAttributeValues: marshall({
            ":backgroundId": background_id,
          }),
          ProjectionExpression: "id",
        };

        const briefBackgroundCmd = new QueryCommand(briefBackgroundParams);
        const briefBackgroundResult = await ddbClient.send(briefBackgroundCmd);

        const briefBackgroundId = briefBackgroundResult.Items[0];

        resp.push({
          id: background_id,
          ...items,
        });

        const {
          ExpressionAttributeNames,
          ExpressionAttributeValues,
          UpdateExpression,
        } = getUpdateExpressions(arrangement);

        if (briefBackgroundId) {
          const updateBriefBackgroundCmd = new UpdateItemCommand({
            TableName: "BriefBackgroundTable",
            Key: briefBackgroundId,
            UpdateExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
          });

          await ddbClient.send(updateBriefBackgroundCmd);
        }

        const updateBackgroundCmd = new UpdateItemCommand({
          TableName: "BackgroundsTable",
          Key: marshall({ id: background_id }),
          UpdateExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
        });

        await ddbClient.send(updateBackgroundCmd);
      })
    );
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
      TableName: "BriefBackgroundTable",
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

async function deleteBackground(id) {
  let resp = {};
  try {
    const briefBackgroundParams = {
      TableName: "BriefBackgroundTable",
      IndexName: "byBackground",
      KeyConditionExpression: "backgroundId = :backgroundId",
      ExpressionAttributeValues: marshall({
        ":backgroundId": id,
      }),
      ProjectionExpression: "id",
    };

    const briefBackgroundCmd = new QueryCommand(briefBackgroundParams);
    const briefBackgroundResult = await ddbClient.send(briefBackgroundCmd);

    const briefBackgroundId = briefBackgroundResult.Items[0];

    const deleteBriefBackgroundCommand = new DeleteItemCommand({
      TableName: "BriefBackgroundTable",
      Key: briefBackgroundId,
    });

    const deleteBriefBackgroundResult = await ddbClient.send(
      deleteBriefBackgroundCommand
    );

    if (deleteBriefBackgroundResult) {
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

async function deleteBrief(id) {
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

async function softDeleteBrief(id, data) {
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

async function deleteRequest(id) {
  let resp = {};
  try {
    const rfiRequestParams = {
      TableName: "RFIRequestTable",
      IndexName: "byRequest",
      KeyConditionExpression: "requestId = :requestId",
      ExpressionAttributeValues: marshall({
        ":requestId": id,
      }),
      ProjectionExpression: "id", // fetch id of RFIRequestTable only
    };

    const rfiRequestCmd = new QueryCommand(rfiRequestParams);
    const rfiRequestResult = await ddbClient.send(rfiRequestCmd);

    const rfiRequestId = rfiRequestResult.Items[0];

    const deleteRFIRequestCommand = new DeleteItemCommand({
      TableName: "RFIRequestTable",
      Key: rfiRequestId,
    });

    const deleteRFIRequestResult = await ddbClient.send(
      deleteRFIRequestCommand
    );

    if (deleteRFIRequestResult) {
      const cmd = new DeleteItemCommand({
        TableName: "RequestTable",
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

async function deleteRFI(id) {
  let resp = {};
  try {
    const clientMatterRFIParams = {
      TableName: "ClientMatterRFITable",
      IndexName: "byRFI",
      KeyConditionExpression: "rfiId = :rfiId",
      ExpressionAttributeValues: marshall({
        ":rfiId": id,
      }),
      ProjectionExpression: "id", // fetch id of ClientMatterRFITable only
    };

    const clientMatterRFICmd = new QueryCommand(clientMatterRFIParams);
    const clientMatterRFIResult = await ddbClient.send(clientMatterRFICmd);

    const clientMatterRFIId = clientMatterRFIResult.Items[0];

    const deleteClientMatterRFICommand = new DeleteItemCommand({
      TableName: "ClientMatterRFITable",
      Key: clientMatterRFIId,
    });

    const deleteClientMatterRFIResult = await ddbClient.send(
      deleteClientMatterRFICommand
    );

    if (deleteClientMatterRFIResult) {
      const cmd = new DeleteItemCommand({
        TableName: "RFITable",
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

async function softDeleteRFI(id, data) {
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

    const clientMatterRFIParams = {
      TableName: "ClientMatterRFITable",
      IndexName: "byRFI",
      KeyConditionExpression: "rfiId = :rfiId",
      ExpressionAttributeValues: marshall({
        ":rfiId": id,
      }),
      ProjectionExpression: "id", // fetch id of ClientMatterRFITable only
    };

    const clientMatterRFICmd = new QueryCommand(clientMatterRFIParams);
    const clientMatterRFIResult = await ddbClient.send(clientMatterRFICmd);

    const clientMatterRFIId = clientMatterRFIResult.Items.map((i) =>
      unmarshall(i)
    )[0].id;

    const cmd = new UpdateItemCommand({
      TableName: "ClientMatterRFITable",
      Key: marshall({ id: clientMatterRFIId }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });

    const request = await ddbClient.send(cmd);

    resp = request ? { id: id } : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function deleteClientMatter(id) {
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

async function createGmailMessage(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      messageId: data.messageId,
      from: data.from,
      to: data.to,
      subject: data.subject,
      snippet: data.snippet,
      connectedEmail: data.connectedEmail,
      receivedAt: data.receivedAt,
      createdAt: toUTC(new Date()),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "GmailMessageTable",
      Item: param,
    });

    const request = await ddbClient.send(cmd);

    const companyGmailMessageParams = {
      id: `${data.companyId}-${rawParams.id}`,
      gmailMessageId: rawParams.id,
      companyId: data.companyId,
      isDeleted: false,
      isSaved: false,
      createdAt: toUTC(new Date()),
      dateReceived: rawParams.receivedAt.toString(),
      filters: `${rawParams.connectedEmail}#${rawParams.from}#${rawParams.to}#${rawParams.subject}#${rawParams.snippet}`,
    };

    const companyGmailMessageCommand = new PutItemCommand({
      TableName: "CompanyGmailMessageTable",
      Item: marshall(companyGmailMessageParams),
    });

    const companyGmailMessageRequest = await ddbClient.send(
      companyGmailMessageCommand
    );

    resp = companyGmailMessageRequest ? rawParams : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function createGmailMessageAttachment(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      messageId: data.messageId,
      s3ObjectKey: data.s3ObjectKey,
      size: data.size,
      type: data.type,
      name: data.name,
      details: data.details,
      order: data.order ? data.order : 0,
      updatedAt: toUTC(new Date()),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "GmailMessageAttachment",
      Item: param,
    });

    const request = await ddbClient.send(cmd);

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

async function saveGmailMessage(id, companyId, data) {
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

    if (!data.isSaved) {
      // unsave
      const gmailClientMattersParam = {
        TableName: "GmailMessageClientMatterTable",
        IndexName: "byGmailMessage",
        KeyConditionExpression: "gmailMessageId = :gmailMessageId",
        ExpressionAttributeValues: marshall({
          ":gmailMessageId": id,
        }),
        ProjectionExpression: "clientMatterId",
      };

      const gmailClientMattersCmd = new QueryCommand(gmailClientMattersParam);
      const gmailClientMattersResult = await ddbClient.send(
        gmailClientMattersCmd
      );

      if (gmailClientMattersResult) {
        const { clientMatterId } = unmarshall(
          gmailClientMattersResult.Items[0]
        );

        const matterFileParam = {
          TableName: "MatterFileTable",
          IndexName: "byMatter",
          KeyConditionExpression: "matterId = :matterId",
          FilterExpression: "gmailMessageId = :gmailMessageId",
          ExpressionAttributeValues: marshall({
            ":matterId": clientMatterId,
            ":gmailMessageId": id,
          }),
          ProjectionExpression: "id",
        };

        const matterFileCmd = new QueryCommand(matterFileParam);
        const matterFileResult = await ddbClient.send(matterFileCmd);

        const matterFileResponse = matterFileResult.Items.map((i) => {
          return {
            DeleteRequest: {
              Key: i,
            },
          };
        });

        let batches = [],
          current_batch = [],
          item_count = 0;

        matterFileResponse.forEach((data) => {
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
          const removeAttachmentsParams = {
            RequestItems: {
              MatterFileTable: data,
            },
          };

          const removeAttachmentsCmd = new BatchWriteItemCommand(
            removeAttachmentsParams
          );
          await ddbClient.send(removeAttachmentsCmd);
        });
      }
    }

    const gmParam = {
      TableName: "CompanyGmailMessageTable",
      IndexName: "byGmailMessage",
      KeyConditionExpression: "gmailMessageId = :gmailMessageId",
      ExpressionAttributeValues: marshall({
        ":gmailMessageId": id,
      }),
    };

    const gmCmd = new QueryCommand(gmParam);
    const gmResult = await ddbClient.send(gmCmd);

    const filterGMResult = gmResult.Items.map((i) => unmarshall(i)).filter(
      (u) => u.companyId === companyId
    );

    const companyGmailMessageID = filterGMResult[0].id;

    const cmd = new UpdateItemCommand({
      TableName: "CompanyGmailMessageTable",
      Key: marshall({ id: companyGmailMessageID }),
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

async function tagUserClientMatter(data) {
  let resp = {};

  try {
    const arrItems = [];

    const userClientMatterIdParams = {
      TableName: "UserClientMatterTable",
      IndexName: "byUser",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: marshall({
        ":userId": data.userId,
      }),
      ProjectionExpression: "id",
    };

    console.log("userClientMatterIdParams", userClientMatterIdParams);

    const userClientMatterIdCmd = new QueryCommand(userClientMatterIdParams);
    const userClientMatterIdRes = await ddbClient.send(userClientMatterIdCmd);

    console.log("userClientMatterIdRes", userClientMatterIdRes);

    if (userClientMatterIdRes.Count !== 0) {
      for (var a = 0; a < userClientMatterIdRes.Items.length; a++) {
        var userClientMatterId = {
          id: userClientMatterIdRes.Items[a].id,
        };
        arrItems.push({
          DeleteRequest: {
            Key: userClientMatterId,
          },
        });
      }
    }

    for (var i = 0; i < data.clientMatterId.length; i++) {
      arrItems.push({
        PutRequest: {
          Item: marshall({
            id: v4(),
            userId: data.userId,
            clientMatterId: data.clientMatterId[i],
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
      const userClientMatterParams = {
        RequestItems: {
          UserClientMatterTable: data,
        },
      };

      const userClientMatterCmd = new BatchWriteItemCommand(
        userClientMatterParams
      );
      await ddbClient.send(userClientMatterCmd);
    });

    resp = { id: data.userId };
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function untagUserClientMatter(data) {
  let resp = {};

  try {
    const arrItems = [];

    const userClientMatterIdParams = {
      TableName: "UserClientMatterTable",
      IndexName: "byUser",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: marshall({
        ":userId": data.userId,
      }),
      ProjectionExpression: "id",
    };

    const userClientMatterIdCmd = new QueryCommand(userClientMatterIdParams);
    const userClientMatterIdRes = await ddbClient.send(userClientMatterIdCmd);

    for (var a = 0; a < userClientMatterIdRes.Items.length; a++) {
      var userClientMatterId = {
        id: userClientMatterIdRes.Items[a].id,
      };
      arrItems.push({
        DeleteRequest: {
          Key: userClientMatterId,
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
      const userClientMatterParams = {
        RequestItems: {
          UserClientMatterTable: data,
        },
      };

      const userClientMatterCmd = new BatchWriteItemCommand(
        userClientMatterParams
      );
      await ddbClient.send(userClientMatterCmd);
    });

    resp = { id: data.userId };
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function tagGmailMessageClientMatter(data) {
  let resp = {};

  try {
    const arrItems = [];

    const gmailMessageClientMatterIdParams = {
      TableName: "GmailMessageClientMatterTable",
      IndexName: "byGmailMessage",
      KeyConditionExpression: "gmailMessageId = :gmailMessageId",
      // FilterExpression: "clientMatterId = :clientMatterId",
      ExpressionAttributeValues: marshall({
        ":gmailMessageId": data.gmailMessageId,
        // ":clientMatterId": data.clientMatterId,
      }),
      ProjectionExpression: "id",
    };

    const gmailMessageClientMatterIdCmd = new QueryCommand(
      gmailMessageClientMatterIdParams
    );
    const gmailMessageClientMatterIdRes = await ddbClient.send(
      gmailMessageClientMatterIdCmd
    );

    for (var a = 0; a < gmailMessageClientMatterIdRes.Items.length; a++) {
      var gmailMessageClientMatterId = {
        id: gmailMessageClientMatterIdRes.Items[a].id,
      };
      arrItems.push({
        DeleteRequest: {
          Key: gmailMessageClientMatterId,
        },
      });
    }

    arrItems.push({
      PutRequest: {
        Item: marshall({
          id: v4(),
          gmailMessageId: data.gmailMessageId,
          clientMatterId: data.clientMatterId,
        }),
      },
    });

    const gmailMessageClientMatterParams = {
      RequestItems: {
        GmailMessageClientMatterTable: arrItems,
      },
    };

    const gmailMessageClientMatterCmd = new BatchWriteItemCommand(
      gmailMessageClientMatterParams
    );

    const gmailMessageClientMatterRes = await ddbClient.send(
      gmailMessageClientMatterCmd
    );

    if (gmailMessageClientMatterRes) {
      resp = { id: data.gmailMessageId };
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

async function tagGmailMessageLabel(data) {
  let resp = {};

  try {
    const arrItems = [];

    const gmailMessageLabelIdParams = {
      TableName: "GmailMessageLabelTable",
      IndexName: "byGmailMessage",
      KeyConditionExpression: "gmailMessageId = :gmailMessageId",
      // FilterExpression: "labelId = :labelId",
      ExpressionAttributeValues: marshall({
        ":gmailMessageId": data.gmailMessageId,
        // ":labelId": data.labelId,
      }),
      ProjectionExpression: "id",
    };

    const gmailMessageLabelIdCmd = new QueryCommand(gmailMessageLabelIdParams);
    const gmailMessageLabelIdRes = await ddbClient.send(gmailMessageLabelIdCmd);

    for (var a = 0; a < gmailMessageLabelIdRes.Items.length; a++) {
      var gmailMessageLabelId = {
        id: gmailMessageLabelIdRes.Items[a].id,
      };
      arrItems.push({
        DeleteRequest: {
          Key: gmailMessageLabelId,
        },
      });
    }

    for (var i = 0; i < data.labelId.length; i++) {
      arrItems.push({
        PutRequest: {
          Item: marshall({
            id: v4(),
            gmailMessageId: data.gmailMessageId,
            labelId: data.labelId[i],
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
      const gmailMessageLabelParams = {
        RequestItems: {
          GmailMessageLabelTable: data,
        },
      };

      const gmailMessageLabelCmd = new BatchWriteItemCommand(
        gmailMessageLabelParams
      );
      await ddbClient.send(gmailMessageLabelCmd);
    });

    resp = { id: data.gmailMessageId };
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function tagGmailAttachmentLabel(data) {
  let resp = {};

  try {
    const arrItems = [];

    const gmailAttachmentLabelIdParams = {
      TableName: "GmailAttachmentLabelTable",
      IndexName: "byGmailAttachment",
      KeyConditionExpression: "attachmentId = :attachmentId",
      // FilterExpression: "labelId = :labelId",
      ExpressionAttributeValues: marshall({
        ":attachmentId": data.attachmentId,
        // ":labelId": data.labelId,
      }),
      ProjectionExpression: "id",
    };

    const gmailAttachmentLabelIdCmd = new QueryCommand(
      gmailAttachmentLabelIdParams
    );
    const gmailAttachmentLabelIdRes = await ddbClient.send(
      gmailAttachmentLabelIdCmd
    );

    for (var a = 0; a < gmailAttachmentLabelIdRes.Items.length; a++) {
      var gmailAttachmentLabelId = {
        id: gmailAttachmentLabelIdRes.Items[a].id,
      };
      arrItems.push({
        DeleteRequest: {
          Key: gmailAttachmentLabelId,
        },
      });
    }

    for (var i = 0; i < data.labelId.length; i++) {
      arrItems.push({
        PutRequest: {
          Item: marshall({
            id: v4(),
            attachmentId: data.attachmentId,
            labelId: data.labelId[i],
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
      const gmailAttachmentLabelParams = {
        RequestItems: {
          GmailAttachmentLabelTable: data,
        },
      };

      const gmailAttachmentLabelCmd = new BatchWriteItemCommand(
        gmailAttachmentLabelParams
      );
      await ddbClient.send(gmailAttachmentLabelCmd);
    });

    resp = { id: data.attachmentId };
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}
async function untagGmailMessageClientMatter(data) {
  let resp = {};

  try {
    const arrItems = [];

    const gmailMessageClientMatterIdParams = {
      TableName: "GmailMessageClientMatterTable",
      IndexName: "byGmailMessage",
      KeyConditionExpression: "gmailMessageId = :gmailMessageId",
      ExpressionAttributeValues: marshall({
        ":gmailMessageId": data.gmailMessageId,
      }),
      ProjectionExpression: "id",
    };

    const gmailMessageClientMatterIdCmd = new QueryCommand(
      gmailMessageClientMatterIdParams
    );
    const gmailMessageClientMatterIdRes = await ddbClient.send(
      gmailMessageClientMatterIdCmd
    );

    for (var a = 0; a < gmailMessageClientMatterIdRes.Items.length; a++) {
      var gmailMessageClientMatterId = {
        id: gmailMessageClientMatterIdRes.Items[a].id,
      };
      arrItems.push({
        DeleteRequest: {
          Key: gmailMessageClientMatterId,
        },
      });
    }

    const gmailMessageClientMatterParams = {
      RequestItems: {
        GmailMessageClientMatterTable: arrItems,
      },
    };

    const gmailMessageClientMatterCmd = new BatchWriteItemCommand(
      gmailMessageClientMatterParams
    );

    const gmailMessageClientMatterRes = await ddbClient.send(
      gmailMessageClientMatterCmd
    );

    if (gmailMessageClientMatterRes) {
      resp = { id: data.gmailMessageId };
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

async function untagGmailMessageLabel(data) {
  let resp = {};

  try {
    const arrItems = [];

    const gmailMessageLabelIdParams = {
      TableName: "GmailMessageLabelTable",
      IndexName: "byGmailMessage",
      KeyConditionExpression: "gmailMessageId = :gmailMessageId",
      ExpressionAttributeValues: marshall({
        ":gmailMessageId": data.gmailMessageId,
      }),
      ProjectionExpression: "id",
    };

    const gmailMessageLabelIdCmd = new QueryCommand(gmailMessageLabelIdParams);
    const gmailMessageLabelIdRes = await ddbClient.send(gmailMessageLabelIdCmd);

    for (var a = 0; a < gmailMessageLabelIdRes.Items.length; a++) {
      var gmailMessageLabelId = {
        id: gmailMessageLabelIdRes.Items[a].id,
      };
      arrItems.push({
        DeleteRequest: {
          Key: gmailMessageLabelId,
        },
      });
    }

    const gmailMessageLabelParams = {
      RequestItems: {
        GmailMessageLabelTable: arrItems,
      },
    };

    const gmailMessageLabelCmd = new BatchWriteItemCommand(
      gmailMessageLabelParams
    );

    const gmailMessageLabelRes = await ddbClient.send(gmailMessageLabelCmd);

    if (gmailMessageLabelRes) {
      resp = { id: data.gmailMessageId };
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

async function untagGmailAttachmentLabel(data) {
  let resp = {};

  try {
    const arrItems = [];

    const gmailAttachmentLabelIdParams = {
      TableName: "GmailAttachmentLabelTable",
      IndexName: "byGmailAttachment",
      KeyConditionExpression: "attachmentId = :attachmentId",
      ExpressionAttributeValues: marshall({
        ":attachmentId": data.attachmentId,
      }),
      ProjectionExpression: "id",
    };

    const gmailAttachmentLabelIdCmd = new QueryCommand(
      gmailAttachmentLabelIdParams
    );
    const gmailAttachmentLabelIdRes = await ddbClient.send(
      gmailAttachmentLabelIdCmd
    );

    for (var a = 0; a < gmailAttachmentLabelIdRes.Items.length; a++) {
      var gmailAttachmentLabelId = {
        id: gmailAttachmentLabelIdRes.Items[a].id,
      };
      arrItems.push({
        DeleteRequest: {
          Key: gmailAttachmentLabelId,
        },
      });
    }

    const gmailAttachmentLabelParams = {
      RequestItems: {
        GmailAttachmentLabelTable: arrItems,
      },
    };

    const gmailAttachmentLabelCmd = new BatchWriteItemCommand(
      gmailAttachmentLabelParams
    );

    const gmailAttachmentLabelRes = await ddbClient.send(
      gmailAttachmentLabelCmd
    );

    if (gmailAttachmentLabelRes) {
      resp = { id: data.attachmentId };
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

async function softDeleteGmailMessage(id, companyId, data) {
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

    const gmParam = {
      TableName: "CompanyGmailMessageTable",
      IndexName: "byGmailMessage",
      KeyConditionExpression: "gmailMessageId = :gmailMessageId",
      ExpressionAttributeValues: marshall({
        ":gmailMessageId": id,
      }),
    };

    const gmCmd = new QueryCommand(gmParam);
    const gmResult = await ddbClient.send(gmCmd);

    const filterGMResult = gmResult.Items.map((i) => unmarshall(i)).filter(
      (u) => u.companyId === companyId
    );

    const companyGmailMessageID = filterGMResult[0].id;

    const cmd = new UpdateItemCommand({
      TableName: "CompanyGmailMessageTable",
      Key: marshall({ id: companyGmailMessageID }),
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

async function bulkSoftDeleteGmailMessage(data) {
  const companyId = data.companyId;

  let resp = [];
  try {
    const asyncResult = await Promise.all(
      data.id.map(async (id) => {
        const data = {
          updatedAt: toUTC(new Date()),
          isDeleted: true,
        };

        resp.push({ id });

        await softDeleteGmailMessage(id, companyId, data);
      })
    );
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function updateGmailMessageAttachment(id, data) {
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
      TableName: "GmailMessageAttachment",
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

async function updateGmailMessageDescription(id, data) {
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
      TableName: "GmailMessageTable",
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

async function disconnectGmail(id) {
  let resp = {};
  try {
    const cmd = new DeleteItemCommand({
      TableName: "GmailTokenTable",
      Key: marshall({ id }),
    });

    const request = await ddbClient.send(cmd);

    resp = request ? { id } : {};
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
    userDelete: async (ctx) => {
      const { id, companyId, email } = ctx.arguments;
      return await deleteUser(id, companyId, email);
    },
    userUpdate: async (ctx) => {
      const {
        id,
        firstName,
        lastName,
        email,
        contactNumber,
        userType,
        profilePicture,
        company,
      } = ctx.arguments;
      const data = {
        updatedAt: toUTC(new Date()),
      };

      if (firstName !== undefined) data.firstName = firstName;

      if (lastName !== undefined) data.lastName = lastName;

      if (email !== undefined) data.email = email;

      if (contactNumber !== undefined) data.contactNumber = contactNumber;

      if (userType !== undefined) data.userType = userType;

      if (profilePicture !== undefined) data.profilePicture = profilePicture;

      if (company !== undefined) data.company = company;

      return await updateUser(id, data);
    },
    userClientMatterTag: async (ctx) => {
      return await tagUserClientMatter(ctx.arguments);
    },

    userClientMatterUntag: async (ctx) => {
      return await untagUserClientMatter(ctx.arguments);
    },

    pageCreate: async (ctx) => {
      return await createPage(ctx.arguments);
    },
    featureCreate: async (ctx) => {
      return await createFeature(ctx.arguments);
    },
    customUserTypeCreate: async (ctx) => {
      return await createCustomUserType(ctx.arguments);
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
        updatedAt: toUTC(new Date()),
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

    // matterFileBulkInitializeOrders: async (ctx) => {
    //   const { clientMatterId } = ctx.arguments; // id and order
    //   return await bulkInitializeMatterFileOrders(clientMatterId);
    // },

    matterFileSoftDelete: async (ctx) => {
      const { id } = ctx.arguments;
      const data = {
        updatedAt: toUTC(new Date()),
        isDeleted: true,
      };

      return await softDeleteMatterFile(id, data);
    },
    matterFileBulkSoftDelete: async (ctx) => {
      return await bulkSoftDeleteMatterFile(ctx.arguments);
    },
    labelCreate: async (ctx) => {
      return await createLabel(ctx.arguments);
    },
    labelBulkCreate: async (ctx) => {
      const { clientMatterId, labels } = ctx.arguments;
      return await bulkCreateLabel(clientMatterId, labels);
    },
    fileLabelTag: async (ctx) => {
      return await tagFileLabel(ctx.arguments);
    },
    labelUpdate: async (ctx) => {
      const { id, name, description } = ctx.arguments;
      const data = {
        updatedAt: toUTC(new Date()),
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
        updatedAt: toUTC(new Date()),
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

    backgroundBulkCreate: async (ctx) => {
      const { briefId, backgrounds } = ctx.arguments;
      return await bulkCreateBackground(briefId, backgrounds);
    },

    briefBackgroundTag: async (ctx) => {
      return await tagBriefBackground(ctx.arguments);
    },
    briefBackgroundUntag: async (ctx) => {
      return await untagBriefBackground(ctx.arguments);
    },

    backgroundUpdate: async (ctx) => {
      const { id, date, description, order } = ctx.arguments;
      const data = {
        updatedAt: toUTC(new Date()),
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

    // backgroundBulkInitializeOrders: async (ctx) => {
    //   const { clientMatterId } = ctx.arguments; // id and order
    //   return await bulkInitializeBackgroundOrders(clientMatterId);
    // },

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
        updatedAt: toUTC(new Date()),
      };

      if (isVisible !== undefined) data.isVisible = isVisible;

      return await updateUserColumnSettings(id, data);
    },
    rfiCreate: async (ctx) => {
      return await createRFI(ctx.arguments);
    },
    rfiUpdate: async (ctx) => {
      const { id, name, description, order } = ctx.arguments;
      const data = {
        updatedAt: toUTC(new Date()),
      };

      if (name !== undefined) data.name = name;

      if (description !== undefined) data.description = description;

      if (order !== undefined) data.order = order;

      return await updateRFI(id, data);
    },
    rfiDelete: async (ctx) => {
      const { id } = ctx.arguments;
      return await deleteRFI(id);
    },
    rfiSoftDelete: async (ctx) => {
      const { id } = ctx.arguments;
      const data = {
        updatedAt: toUTC(new Date()),
        isDeleted: true,
      };
      return await softDeleteRFI(id, data);
    },
    requestCreate: async (ctx) => {
      return await createRequest(ctx.arguments);
    },
    requestUpdate: async (ctx) => {
      const { id, question, answer, itemNo, order } = ctx.arguments;
      const data = {
        updatedAt: toUTC(new Date()),
      };

      if (question !== undefined) data.question = question;

      if (answer !== undefined) data.answer = answer;

      if (itemNo !== undefined) data.itemNo = itemNo;

      if (order !== undefined) data.order = order;

      return await updateRequest(id, data);
    },
    requestDelete: async (ctx) => {
      const { id } = ctx.arguments;
      return await deleteRequest(id);
    },
    briefCreate: async (ctx) => {
      return await createBrief(ctx.arguments);
    },
    briefUpdate: async (ctx) => {
      const { id, date, name, order } = ctx.arguments;
      const data = {
        updatedAt: toUTC(new Date()),
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
    briefSoftDelete: async (ctx) => {
      const { id } = ctx.arguments;
      const data = {
        updatedAt: toUTC(new Date()),
        isDeleted: true,
      };

      return await softDeleteBrief(id, data);
    },
    gmailMessageCreate: async (ctx) => {
      return await createGmailMessage(ctx.arguments);
    },

    gmailMessageSave: async (ctx) => {
      const { id, companyId, isSaved } = ctx.arguments;
      const data = {
        updatedAt: toUTC(new Date()),
        isSaved: isSaved,
      };

      return await saveGmailMessage(id, companyId, data);
    },

    gmailMessageClientMatterTag: async (ctx) => {
      return await tagGmailMessageClientMatter(ctx.arguments);
    },
    gmailMessageClientMatterUntag: async (ctx) => {
      return await untagGmailMessageClientMatter(ctx.arguments);
    },

    gmailMessageLabelTag: async (ctx) => {
      return await tagGmailMessageLabel(ctx.arguments);
    },

    gmailMessageLabelUntag: async (ctx) => {
      return await untagGmailMessageLabel(ctx.arguments);
    },

    gmailAttachmentLabelTag: async (ctx) => {
      return await tagGmailAttachmentLabel(ctx.arguments);
    },
    gmailAttachmentLabelUntag: async (ctx) => {
      return await untagGmailAttachmentLabel(ctx.arguments);
    },

    gmailMessageSoftDelete: async (ctx) => {
      const { id, companyId } = ctx.arguments;
      const data = {
        updatedAt: toUTC(new Date()),
        isDeleted: true,
      };

      return await softDeleteGmailMessage(id, companyId, data);
    },
    gmailMessageBulkSoftDelete: async (ctx) => {
      return await bulkSoftDeleteGmailMessage(ctx.arguments);
    },
    gmailConnectFromCode: async (ctx) => {
      const { code, email, userId, companyId, userTimeZone } = ctx.arguments;
      const token = await googleAuth.getToken(code);

      const data = {
        email,
        userId,
        companyId,
        refreshToken: token.tokens.refresh_token,
        userTimeZone,
      };

      return addToken(data);
    },
    gmailDisconnect: async (ctx) => {
      const { email } = ctx.arguments;
      return await disconnectGmail(email);
    },

    gmailMessageAttachmentCreate: async (ctx) => {
      return await createGmailMessageAttachment(ctx.arguments);
    },
    gmailMessageAttachmentUpdate: async (ctx) => {
      const { id, details } = ctx.arguments;
      const data = {
        updatedAt: toUTC(new Date()),
      };

      if (details !== undefined) data.details = details;

      return await updateGmailMessageAttachment(id, data);
    },
    gmailMessageDescriptionUpdate: async (ctx) => {
      const { id, description } = ctx.arguments;
      const data = {
        updatedAt: toUTC(new Date()),
      };

      if (description !== undefined) data.description = description;

      return await updateGmailMessageDescription(id, data);
    },
  },
};

exports.handler = async (ctx) => {
  console.log(
    "~aqs.watch:: run mutation >>",
    ctx.info.fieldName,
    ctx.arguments
  );
  const typeHandler = resolvers[ctx.info.parentTypeName];
  if (typeHandler) {
    const resolver = typeHandler[ctx.info.fieldName];
    if (resolver) {
      return await resolver(ctx);
    }
  }
  throw new Error("Resolver not found.");
};
