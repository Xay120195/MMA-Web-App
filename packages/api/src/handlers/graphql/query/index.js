const client = require("../../../lib/dynamodb-client");
const {
  GetItemCommand,
  ScanCommand,
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { getUser } = require("../../../services/UserService");
const { getMatterFile, getFile } = require("../../../services/MatterService");

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
    console.log(response);
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
    console.log(response);
  }

  return response;
}

async function listClients() {
  try {
    const params = {
      TableName: "ClientsTable",
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
    console.log(response);
  }

  return response;
}

async function listCompanies() {
  try {
    const params = {
      TableName: "CompanyTable",
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
    console.log(response);
  }

  return response;
}

async function listMatters() {
  try {
    const params = {
      TableName: "MatterTable",
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
    console.log(response);
  }

  return response;
}

async function listLabels() {
  try {
    const params = {
      TableName: "LabelsTable",
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
    console.log(response);
  }
  return response;
}

async function listClientMatters() {
  try {
    const params = {
      TableName: "ClientMatterTable",
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
    console.log(response);
  }
  return response;
}

async function listBackgrounds() {
  try {
    const params = {
      TableName: "BackgroundsTable",
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
    console.log(response);
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
    console.log(response);
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
    console.log(response);
  }
  return response;
}

async function getClient(data) {
  try {
    const params = {
      TableName: "ClientsTable",
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
    console.log(response);
  }
  return response;
}

async function getMatter(data) {
  try {
    const params = {
      TableName: "MatterTable",
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
    console.log(response);
  }
  return response;
}

async function getLabel(data) {
  try {
    const params = {
      TableName: "LabelsTable",
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
    console.log(response);
  }
  return response;
}

async function listColumnSettingsByTable(data) {
  try {
    const params = {
      TableName: "ColumnSettingsTable",
      IndexName: "byTableName",
      KeyConditionExpression: "tableName = :tableName",
      ExpressionAttributeValues: marshall({
        ":tableName": data.tableName,
      }),
    };

    const command = new QueryCommand(params);
    const request = await client.send(command);

    const result = request.Items.map((d) => unmarshall(d));

    response = request ? result : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
    console.log(response);
  }
  return response;
}

async function getBackground(data) {
  try {
    const params = {
      TableName: "BackgroundsTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const command = new GetItemCommand(params);
    const { Item } = await client.send(command);

    const backgrounds = unmarshall(Item);

    const backgroundFileParams = {
      TableName: "BackgroundFileTable",
      IndexName: "byBackground",
      KeyConditionExpression: "backgroundId = :backgroundId",
      ExpressionAttributeValues: marshall({
        ":backgroundId": backgrounds.id,
      }),
    };

    const backgroundFileCommand = new QueryCommand(backgroundFileParams);
    const backgroundFileResult = await client.send(backgroundFileCommand);

    const fileIds = backgroundFileResult.Items.map((i) => unmarshall(i)).map(
      (f) => marshall({ id: f.fileId })
    );

    if (fileIds.length != 0) {
      const fileParams = {
        RequestItems: {
          MatterFileTable: {
            Keys: fileIds,
          },
        },
      };

      const filesCommand = new BatchGetItemCommand(fileParams);
      const filesResult = await client.send(filesCommand);

      const objFiles = filesResult.Responses.MatterFileTable.map((i) =>
        unmarshall(i)
      );
      const objBackgroundFiles = backgroundFileResult.Items.map((i) =>
        unmarshall(i)
      );

      const extractFiles = objBackgroundFiles.map((item) => {
        const filterFile = objFiles.find((u) => u.id === item.fileId);
        return { ...filterFile };
      });

      backgrounds.files = { items: extractFiles };
    }

    response = backgrounds ? backgrounds : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
    console.log(response);
  }
  return response;
}

async function getClientMatter(data) {
  const clientMatterId = data.id;
  try {
    const params = {
      TableName: "ClientMatterTable",
      Key: marshall({
        id: clientMatterId,
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
    console.log(response);
  }
  return response;
}

async function getUserColumnSettings(data) {
  const { userId, tableName } = data;

  let response = {},
    result = {};
  try {
    const userColumnSettingsParams = {
      TableName: "UserColumnSettingsTable",
      IndexName: "byUser",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: marshall({
        ":userId": userId,
      }),
    };

    const userColumnSettingsCommand = new QueryCommand(
      userColumnSettingsParams
    );
    const userColumnSettingsRequest = await client.send(
      userColumnSettingsCommand
    );

    //const userColumnSettings = userColumnSettingsRequest.Items.map((i) => unmarshall(i));

    const columnSettingsIds = userColumnSettingsRequest.Items.map((i) =>
      unmarshall(i)
    ).map((f) => marshall({ id: f.columnSettings.id }));

    if (columnSettingsIds.length != 0) {
      const ColumnSettingsParams = {
        RequestItems: {
          ColumnSettingsTable: {
            Keys: columnSettingsIds,
          },
        },
      };

      const columnSettingsCommand = new BatchGetItemCommand(
        ColumnSettingsParams
      );
      const columnSettingsResult = await client.send(columnSettingsCommand);

      const objColumnSettings =
        columnSettingsResult.Responses.ColumnSettingsTable.map((i) =>
          unmarshall(i)
        );
      const objUserColumnSettings = userColumnSettingsRequest.Items.map((i) =>
        unmarshall(i)
      );

      result = objUserColumnSettings
        .map((item) => {
          const filterColumnSettings = objColumnSettings.find(
            (u) => u.id === item.columnSettings.id
          );
          return { ...item, ...{ columnSettings: filterColumnSettings } };
        })
        .filter(({ columnSettings }) => columnSettings.tableName === tableName);
    }

    response = (Object.keys(result).length !== 0 && result !== null) ? result : [];
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
      statusCode: 500,
    };
    console.log(response);
  }

  return response;
}

const resolvers = {
  Query: {
    company: async (ctx) => {
      return getCompany(ctx.arguments);
    },
    companies: async () => {
      return listCompanies();
    },
    pages: async () => {
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
    clients: async (ctx) => {
      return listClients(ctx.arguments);
    },
    matter: async (ctx) => {
      return getMatter(ctx.arguments);
    },
    matters: async (ctx) => {
      return listMatters(ctx.arguments);
    },
    clientMatter: async (ctx) => {
      return getClientMatter(ctx.arguments);
    },
    clientMatters: async (ctx) => {
      return listClientMatters(ctx.arguments);
    },
    label: async (ctx) => {
      return getLabel(ctx.arguments);
    },
    labels: async (ctx) => {
      return listLabels(ctx.arguments);
    },
    companyAccessType: async (ctx) => {
      return getCompanyAccessType(ctx.arguments);
    },
    matterFile: async (ctx) => {
      return getMatterFile(ctx.arguments);
    },
    file: async (ctx) => {
      return getFile(ctx.arguments);
    },
    background: async (ctx) => {
      return getBackground(ctx.arguments);
    },
    backgrounds: async (ctx) => {
      return listBackgrounds(ctx.arguments);
    },
    columnSettings: async (ctx) => {
      return listColumnSettingsByTable(ctx.arguments);
    },
    userColumnSettings: async (ctx) => {
      return getUserColumnSettings(ctx.arguments);
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
