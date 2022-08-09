const ddbClient = require("../../../lib/dynamodb-client");
const {
  GetItemCommand,
  ScanCommand,
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const { getUser, listUsers } = require("../../../services/UserService");
const { getRFI, listRFIs } = require("../../../services/RFIService");
const {
  getCustomUserType,
  listCustomUserTypes,
} = require("../../../services/CustomUserTypeService");
const { getTeam, listTeams } = require("../../../services/TeamService");

const {
  getRequest,
  listRequests,
} = require("../../../services/RequestService");
const {
  getFile,
  getMatterFiles,
} = require("../../../services/MatterFileService");

async function getCompany(data) {
  try {
    const param = {
      TableName: "CompanyTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const cmd = new GetItemCommand(param);
    const { Item } = await ddbClient.send(cmd);
    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function listPages() {
  try {
    const param = {
      TableName: "PageTable",
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function listFeatures() {
  try {
    const param = {
      TableName: "FeatureTable",
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);

    const parseResponse = request.Items.map((data) => unmarshall(data));

    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function listClients() {
  try {
    const param = {
      TableName: "ClientsTable",
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function listCompanies() {
  try {
    const param = {
      TableName: "CompanyTable",
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function listMatters() {
  try {
    const param = {
      TableName: "MatterTable",
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function listLabels() {
  try {
    const param = {
      TableName: "LabelsTable",
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function listClientMatters() {
  try {
    const param = {
      TableName: "ClientMatterTable",
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function listBackgrounds() {
  try {
    const param = {
      TableName: "BackgroundsTable",
      ScanIndexForward: false,
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function listFiles() {
  try {
    const param = {
      TableName: "MatterFileTable",
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function getCompanyAccessType(data) {
  try {
    const param = {
      TableName: "CompanyAccessTypeTable",
      IndexName: "byCompany",
      KeyConditionExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall({
        ":companyId": data.companyId,
      }),
    };

    const cmd = new QueryCommand(param);
    const request = await ddbClient.send(cmd);
    var parseResponse = request.Items.map((data) => unmarshall(data));

    if (data.userType) {
      parseResponse = request.Items.map((data) => unmarshall(data)).filter(
        (userType) => userType.userType === data.userType
      );
    }
    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function getFeature(data) {
  try {
    const param = {
      TableName: "FeatureTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const cmd = new GetItemCommand(param);
    const { Item } = await ddbClient.send(cmd);
    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function getPage(data) {
  try {
    const param = {
      TableName: "PageTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const cmd = new GetItemCommand(param);
    const { Item } = await ddbClient.send(cmd);
    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function getClient(data) {
  try {
    const param = {
      TableName: "ClientsTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const cmd = new GetItemCommand(param);
    const { Item } = await ddbClient.send(cmd);
    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function getMatter(data) {
  try {
    const param = {
      TableName: "MatterTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const cmd = new GetItemCommand(param);
    const { Item } = await ddbClient.send(cmd);
    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function getLabel(data) {
  try {
    const param = {
      TableName: "LabelsTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const cmd = new GetItemCommand(param);
    const { Item } = await ddbClient.send(cmd);
    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function bulkGetLabels(data) {
  try {
    const { id } = data;

    const labelIds = id.map((f) => marshall({ id: f }));

    if (labelIds.length !== 0) {
      labelIds.filter(function (item, i, ar) {
        return ar.indexOf(item) === i;
      });

      const labelsParam = {
        RequestItems: {
          LabelsTable: {
            Keys: labelIds,
          },
        },
      };

      const labelsCommand = new BatchGetItemCommand(labelsParam);
      const labelsResult = await ddbClient.send(labelsCommand);

      const objLabels = labelsResult.Responses.LabelsTable.map((i) =>
        unmarshall(i)
      );

      resp = objLabels;
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

async function listColumnSettingsByTable(data) {
  try {
    const param = {
      TableName: "ColumnSettingsTable",
      IndexName: "byTableName",
      KeyConditionExpression: "tableName = :tableName",
      ExpressionAttributeValues: marshall({
        ":tableName": data.tableName,
      }),
    };

    const cmd = new QueryCommand(param);
    const request = await ddbClient.send(cmd);

    const result = request.Items.map((d) => unmarshall(d));

    resp = request ? result : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function getBackground(data) {
  try {
    const param = {
      TableName: "BackgroundsTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const cmd = new GetItemCommand(param);
    const { Item } = await ddbClient.send(cmd);
    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function getClientMatter(data) {
  const clientMatterId = data.id;
  try {
    const param = {
      TableName: "ClientMatterTable",
      Key: marshall({
        id: clientMatterId,
      }),
    };

    const cmd = new GetItemCommand(param);

    const { Item } = await ddbClient.send(cmd);

    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function getUserColumnSettings(data) {
  const { userId, tableName } = data;

  let resp = {},
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
    const userColumnSettingsRequest = await ddbClient.send(
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
      const columnSettingsResult = await ddbClient.send(columnSettingsCommand);

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

    //console.log(result);
    resp =
      Object.keys(result).length !== 0 && result !== null && result !== {}
        ? result
        : [];
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

async function getBrief(data) {
  try {
    const param = {
      TableName: "BriefTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const cmd = new GetItemCommand(param);
    const { Item } = await ddbClient.send(cmd);
    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function getBriefByName(data) {
  try {
    const { clientMatterId, name } = data;
    const ExpressionAttributeValues = {
      ":clientMatterId": clientMatterId,
      ":isDeleted": false,
    };

    const cmBriefParam = {
      TableName: "ClientMatterBriefTable",
      IndexName: "byClientMatter",
      KeyConditionExpression: "clientMatterId = :clientMatterId",
      FilterExpression:
        "isDeleted = :isDeleted OR attribute_not_exists(isDeleted)",
      ExpressionAttributeValues: marshall(ExpressionAttributeValues),
    };

    const cmBriefCmd = new QueryCommand(cmBriefParam);
    const cmBriefResult = await ddbClient.send(cmBriefCmd);

    const objCMBrief = cmBriefResult.Items.map((i) => unmarshall(i));

    console.log(objCMBrief);

    const briefIds = objCMBrief.map((f) => marshall({ id: f.briefId }));

    if (briefIds.length !== 0) {
      const briefParam = {
        RequestItems: {
          BriefTable: {
            Keys: briefIds,
          },
        },
      };

      const briefCommand = new BatchGetItemCommand(briefParam);
      const briefResult = await ddbClient.send(briefCommand);

      const objBriefs = briefResult.Responses.BriefTable.map((i) =>
        unmarshall(i)
      );

      const response = objCMBrief
        .map((item) => {
          const filterBrief = objBriefs.find(
            (u) => u.id === item.briefId && u.name === name
          );

          if (filterBrief !== undefined) {
            return { ...item, ...filterBrief };
          }
        })
        .filter((a) => a !== undefined);

      return response[0];
    } else {
      return {
        items: [],
        nextToken: null,
      };
    }

    // resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function listBriefs() {
  try {
    const param = {
      TableName: "BriefTable",
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function getGmailMessage(data) {
  try {
    const param = {
      TableName: "GmailMessageTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const cmd = new GetItemCommand(param);
    const { Item } = await ddbClient.send(cmd);
    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function getAttachment(data) {
  let resp = {};
  try {
    const param = {
      TableName: "GmailMessageAttachment",
      Key: marshall({
        id: data.id,
      }),
    };
    const cmd = new GetItemCommand(param);
    const { Item } = await ddbClient.send(cmd);
    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

async function listGmailMessages() {
  try {
    const param = {
      TableName: "GmailMessageTable",
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    resp = request ? parseResponse : {};
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
  Query: {
    company: async (ctx) => {
      return getCompany(ctx.arguments);
    },
    companies: async () => {
      return listCompanies();
    },
    page: async (ctx) => {
      return getPage(ctx.arguments);
    },
    pages: async () => {
      return listPages();
    },
    user: async (ctx) => {
      return getUser(ctx.arguments);
    },
    users: async () => {
      return listUsers();
    },
    feature: async (ctx) => {
      return getFeature(ctx.arguments);
    },
    features: async () => {
      return listFeatures();
    },
    client: async (ctx) => {
      return getClient(ctx.arguments);
    },
    clients: async () => {
      return listClients();
    },
    matter: async (ctx) => {
      return getMatter(ctx.arguments);
    },
    matters: async () => {
      return listMatters();
    },
    clientMatter: async (ctx) => {
      return getClientMatter(ctx.arguments);
    },
    clientMatters: async () => {
      return listClientMatters();
    },
    label: async (ctx) => {
      return getLabel(ctx.arguments);
    },
    multipleLabels: async (ctx) => {
      return bulkGetLabels(ctx.arguments);
    },
    labels: async () => {
      return listLabels();
    },
    companyAccessType: async (ctx) => {
      return getCompanyAccessType(ctx.arguments);
    },
    file: async (ctx) => {
      return getFile(ctx.arguments);
    },
    files: async () => {
      return listFiles();
    },
    // matterFile: async (ctx) => {
    //   return getMatterFile(ctx.arguments);
    // },
    matterFiles: async (ctx) => {
      return getMatterFiles(ctx.arguments);
    },
    background: async (ctx) => {
      return getBackground(ctx.arguments);
    },
    backgrounds: async () => {
      return listBackgrounds();
    },
    columnSettings: async (ctx) => {
      return listColumnSettingsByTable(ctx.arguments);
    },
    userColumnSettings: async (ctx) => {
      return getUserColumnSettings(ctx.arguments);
    },
    rfi: async (ctx) => {
      return getRFI(ctx.arguments);
    },
    rfis: async () => {
      return listRFIs();
    },
    request: async (ctx) => {
      return getRequest(ctx.arguments);
    },
    requests: async () => {
      return listRequests();
    },
    brief: async (ctx) => {
      return getBrief(ctx.arguments);
    },
    briefByName: async (ctx) => {
      return getBriefByName(ctx.arguments);
    },
    briefs: async () => {
      return listBriefs();
    },
    gmailMessage: async (ctx) => {
      return getGmailMessage(ctx.arguments);
    },
    gmailMessages: async () => {
      return listGmailMessages();
    },
    gmailAttachment: async (ctx) => {
      return getAttachment(ctx.arguments);
    },
    customUserTypes: async () => {
      return listCustomUserTypes();
    },
    customUserType: async (ctx) => {
      return getCustomUserType(ctx.arguments);
    },
    teams: async () => {
      return listTeams();
    },
    team: async (ctx) => {
      return getTeam(ctx.arguments);
    },
  },
};

exports.handler = async (ctx) => {
  console.log("~aqs.watch:: run query >>", ctx.info.fieldName, ctx.arguments);
  const typeHandler = resolvers[ctx.info.parentTypeName];
  if (typeHandler) {
    const resolver = typeHandler[ctx.info.fieldName];
    if (resolver) {
      return await resolver(ctx);
    }
  }
  throw new Error("Resolver not found.");
};
