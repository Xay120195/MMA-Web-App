const ddbClient = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
var momentTZ = require("moment-timezone");

async function listCompUsers(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;
  try {
    const compUsersParam = {
      TableName: "CompanyUserTable",
      IndexName: "byCompany",
      KeyConditionExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall({
        ":companyId": id,
      }),
      ScanIndexForward: false,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      compUsersParam.Limit = limit;
    }

    const compUsersCmd = new QueryCommand(compUsersParam);
    const compUsersResult = await ddbClient.send(compUsersCmd);

    const userIds = compUsersResult.Items.map((i) => unmarshall(i)).map((f) =>
      marshall({ id: f.userId })
    );

    if (userIds.length !== 0) {
      const usersParam = {
        RequestItems: {
          UserTable: {
            Keys: userIds,
          },
        },
      };

      const usersCmd = new BatchGetItemCommand(usersParam);
      const usersResult = await ddbClient.send(usersCmd);

      const objUsers = usersResult.Responses.UserTable.map((i) =>
        unmarshall(i)
      );
      const objCompUsers = compUsersResult.Items.map((i) => unmarshall(i));

      const response = objCompUsers
        .map((item) => {
          const filterUser = objUsers.find((u) => u.id === item.userId);

          if (filterUser !== undefined) {
            return { ...item, ...filterUser };
          }
        })
        .filter((a) => a !== undefined);

      return {
        items: response,
        nextToken: compUsersResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(compUsersResult.LastEvaluatedKey)
            ).toString("base64")
          : null,
      };
    } else {
      return {
        items: [],
        nextToken: null,
      };
    }
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(response);
  }
  return response;
}

async function listCompMatters(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;
  try {
    const compMattersParam = {
      TableName: "CompanyMatterTable",
      IndexName: "byCompany",
      KeyConditionExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall({
        ":companyId": id,
      }),
      ScanIndexForward: false,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      compMattersParam.Limit = limit;
    }

    const compMattersCmd = new QueryCommand(compMattersParam);
    const compMattersResult = await ddbClient.send(compMattersCmd);

    const matterIds = compMattersResult.Items.map((i) => unmarshall(i)).map(
      (f) => marshall({ id: f.matterId })
    );

    if (matterIds.length !== 0) {
      const mattersParam = {
        RequestItems: {
          MatterTable: {
            Keys: matterIds,
          },
        },
      };

      const mattersCmd = new BatchGetItemCommand(mattersParam);
      const mattersResult = await ddbClient.send(mattersCmd);

      const objMatters = mattersResult.Responses.MatterTable.map((i) =>
        unmarshall(i)
      );
      const objCompMatters = compMattersResult.Items.map((i) => unmarshall(i));

      // const response = objCompMatters.map((item) => {
      //   const filterMatter = objMatters.find((u) => u.id === item.matterId);
      //   return { ...item, ...filterMatter };
      // });

      const response = objCompMatters
        .map((item) => {
          const filterMatter = objMatters.find((u) => u.id === item.matterId);

          if (filterMatter !== undefined) {
            return { ...item, ...filterMatter };
          }
        })
        .filter((a) => a !== undefined);

      return {
        items: response,
        nextToken: compMattersResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(compMattersResult.LastEvaluatedKey)
            ).toString("base64")
          : null,
      };
    } else {
      return {
        items: [],
        nextToken: null,
      };
    }
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(response);
  }
  return response;
}

async function listCompClients(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;

  try {
    const compClientsParam = {
      TableName: "CompanyClientTable",
      IndexName: "byCompany",
      KeyConditionExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall({
        ":companyId": id,
      }),
      ScanIndexForward: false,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      compClientsParam.Limit = limit;
    }

    const compClientsCmd = new QueryCommand(compClientsParam);
    const compClientsResult = await ddbClient.send(compClientsCmd);
    const clientIds = compClientsResult.Items.map((i) => unmarshall(i)).map(
      (f) => marshall({ id: f.clientId })
    );

    if (clientIds.length !== 0) {
      const clientsParam = {
        RequestItems: {
          ClientsTable: {
            Keys: clientIds,
          },
        },
      };

      const clientsCmd = new BatchGetItemCommand(clientsParam);
      const clientsResult = await ddbClient.send(clientsCmd);

      const objClients = clientsResult.Responses.ClientsTable.map((i) =>
        unmarshall(i)
      );
      const objCompClients = compClientsResult.Items.map((i) => unmarshall(i));

      // const response = objCompClients.map((item) => {
      //   const filterClient = objClients.find((u) => u.id === item.clientId);
      //   return { ...item, ...filterClient };
      // });

      const response = objCompClients
        .map((item) => {
          const filterClient = objClients.find((u) => u.id === item.clientId);

          if (filterClient !== undefined) {
            return { ...item, ...filterClient };
          }
        })
        .filter((a) => a !== undefined);

      return {
        items: response,
        nextToken: compClientsResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(compClientsResult.LastEvaluatedKey)
            ).toString("base64")
          : null,
      };
    } else {
      return {
        items: [],
        nextToken: null,
      };
    }
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(response);
  }
  return response;
}

async function listCompClientMatters(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken, sortOrder = "CREATED_DESC" } = ctx.arguments;

  let indexName,
    isAscending = true;

  if (sortOrder.includes("_DESC")) {
    isAscending = false;
  }

  if (sortOrder.includes("CREATED_")) {
    indexName = "byCreatedAt";
  } else if (sortOrder.includes("ORDER_")) {
    indexName = "byOrder";
  }

  try {
    const compCMParam = {
      TableName: "CompanyClientMatterTable",
      IndexName: indexName,
      KeyConditionExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall({
        ":companyId": id,
      }),
      ScanIndexForward: isAscending,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
      ProjectionExpression: "clientMatterId",
    };

    if (limit !== undefined) {
      compCMParam.Limit = limit;
    }

    const compCMCmd = new QueryCommand(compCMParam);
    const compCMResult = await ddbClient.send(compCMCmd);

    const clientMatterIds = compCMResult.Items.map((i) => unmarshall(i)).map(
      (f) => marshall({ id: f.clientMatterId })
    );

    if (clientMatterIds.length !== 0) {
      let batches = [],
        current_batch = [],
        item_count = 0;

      clientMatterIds.forEach((data) => {
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

      const asyncResult = await Promise.all(
        batches.map(async (data, index) => {
          const clientmattersParam = {
            RequestItems: {
              ClientMatterTable: {
                Keys: data,
              },
            },
          };

          const cmCmd = new BatchGetItemCommand(clientmattersParam);
          const cmResult = await ddbClient.send(cmCmd);
          return cmResult.Responses.ClientMatterTable;
        })
      );

      const objCM = asyncResult.flat().map((i) => unmarshall(i));

      const objCompCM = compCMResult.Items.map((i) => unmarshall(i));

      // const response = objCompCM.map((item) => {
      //   const filterClientMatter = objCM.find(
      //     (u) => u.id === item.clientMatterId
      //   );
      //   return { ...item, ...filterClientMatter };
      // });

      const response = objCompCM
        .map((item) => {
          const filterClientMatter = objCM.find(
            (u) => u.id === item.clientMatterId
          );

          if (filterClientMatter !== undefined) {
            return { ...item, ...filterClientMatter };
          }
        })
        .filter((a) => a !== undefined);

      return {
        items: response,
        nextToken: compCMResult.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(compCMResult.LastEvaluatedKey)).toString(
              "base64"
            )
          : null,
      };
    } else {
      return {
        items: [],
        nextToken: null,
      };
    }
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(response);
  }
  return response;
}

async function listCompGmailMessages(ctx) {
  const { id } = ctx.source;
  const {
    limit,
    nextToken,
    sortOrder = "CREATED_DESC",
    isDeleted = false,
    isSaved = false,
    recipient,
    startDate,
    endDate,
    userTimeZone = "Australia/Sydney",
  } = ctx.arguments;

  let indexName,
    isAscending = true;

  if (sortOrder.includes("_DESC")) {
    isAscending = false;
  }

  if (sortOrder.includes("CREATED_")) {
    indexName = "byDateReceived";
  }

  try {
    const ExpressionAttributeValues = {
        ":companyId": id,
        ":isSaved": isSaved,
        ":isDeleted": isDeleted,
      },
      FilterExpression = ["isSaved = :isSaved", "isDeleted = :isDeleted"],
      ConditionExpression = ["companyId = :companyId"];

    if (recipient) {
      ExpressionAttributeValues[":recipient"] = recipient.toLowerCase();
      FilterExpression.push("begins_with(filters, :recipient)");
    }

    if (startDate && endDate) {
      const getTZ = momentTZ(startDate).tz(userTimeZone).format("Z");
      const stDate = new Date(`${startDate}T00:00:00${getTZ}`).getTime();
      const eDate = new Date(`${endDate}T23:59:59${getTZ}`).getTime();
      ExpressionAttributeValues[":startDate"] = stDate.toString();
      ExpressionAttributeValues[":endDate"] = eDate.toString();
      ConditionExpression.push("dateReceived BETWEEN :startDate AND :endDate");
    }

    const compCMParam = {
      TableName: "CompanyGmailMessageTable",
      IndexName: indexName,
      KeyConditionExpression: ConditionExpression.join(" AND "),
      FilterExpression: FilterExpression.join(" AND "),
      ExpressionAttributeValues: marshall(ExpressionAttributeValues),

      ScanIndexForward: isAscending,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
      ProjectionExpression: "gmailMessageId",
    };

    if (limit !== undefined) {
      compCMParam.Limit = limit;
    }

    const compCMCmd = new QueryCommand(compCMParam);
    const compCMResult = await ddbClient.send(compCMCmd);

    let unique = compCMResult.Items.map((a) => unmarshall(a))
      .map((x) => x.gmailMessageId)
      .filter(function (item, i, ar) {
        return ar.indexOf(item) === i;
      });

    const gmailMessageIds = unique.map((f) => marshall({ id: f }));

    if (gmailMessageIds.length !== 0) {
      let batches = [],
        current_batch = [],
        item_count = 0;

      gmailMessageIds.forEach((data) => {
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

      const asyncResult = await Promise.all(
        batches.map(async (data, index) => {
          const clientmattersParam = {
            RequestItems: {
              GmailMessageTable: {
                Keys: data,
              },
            },
          };

          const cmCmd = new BatchGetItemCommand(clientmattersParam);
          const cmResult = await ddbClient.send(cmCmd);
          return cmResult.Responses.GmailMessageTable;
        })
      );

      const objCM = asyncResult.flat().map((i) => unmarshall(i));

      const objCompCM = compCMResult.Items.map((i) => unmarshall(i));

      const response = objCompCM
        .map((item) => {
          const filterGmailMessage = objCM.find(
            (u) => u.id === item.gmailMessageId
          );

          if (filterGmailMessage !== undefined) {
            return { ...item, ...filterGmailMessage };
          }
        })
        .filter((a) => a !== undefined);

      return {
        items: response,
        nextToken: compCMResult.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(compCMResult.LastEvaluatedKey)).toString(
              "base64"
            )
          : null,
      };
    } else {
      return {
        items: [],
        nextToken: null,
      };
    }
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(response);
  }
  return response;
}

async function getCompGmailToken(ctx) {
  const { id } = ctx.source;

  try {
    const ExpressionAttributeValues = {
      ":companyId": id,
    };

    const compGTParam = {
      TableName: "GmailTokenTable",
      IndexName: "byCompany",
      KeyConditionExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall(ExpressionAttributeValues),
    };

    const compGTCmd = new QueryCommand(compGTParam);
    const { Items } = await ddbClient.send(compGTCmd);

    response = Items.length !== 0 ? unmarshall(Items[0]) : {};
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(response);
  }
  return response;
}

async function listCompCustomUserTypes(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;

  try {
    const compCustomUserTypesParam = {
      TableName: "CompanyCustomUserTypeTable",
      IndexName: "byCompany",
      KeyConditionExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall({
        ":companyId": id,
      }),
      ScanIndexForward: false,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      compCustomUserTypesParam.Limit = limit;
    }

    const compCustomUserTypesCmd = new QueryCommand(compCustomUserTypesParam);
    const compCustomUserTypesResult = await ddbClient.send(compCustomUserTypesCmd);
    const customUserTypeIds = compCustomUserTypesResult.Items.map((i) => unmarshall(i)).map(
      (f) => marshall({ id: f.customUserTypeId })
    );

    if (customUserTypeIds.length !== 0) {
      const customUserTypesParam = {
        RequestItems: {
          CustomUserTypeTable: {
            Keys: customUserTypeIds,
          },
        },
      };

      const customUserTypesCmd = new BatchGetItemCommand(customUserTypesParam);
      const customUserTypesResult = await ddbClient.send(customUserTypesCmd);

      const objCustomUserTypes = customUserTypesResult.Responses.CustomUserTypeTable.map((i) =>
        unmarshall(i)
      );
      const objCompCustomUserTypes = compCustomUserTypesResult.Items.map((i) => unmarshall(i));

      // const response = objCompCustomUserTypes.map((item) => {
      //   const filterCustomUserType = objCustomUserTypes.find((u) => u.id === item.customUserTypeId);
      //   return { ...item, ...filterCustomUserType };
      // });

      const response = objCompCustomUserTypes
        .map((item) => {
          const filterCustomUserType = objCustomUserTypes.find((u) => u.id === item.customUserTypeId);

          if (filterCustomUserType !== undefined) {
            return { ...item, ...filterCustomUserType };
          }
        })
        .filter((a) => a !== undefined);

      return {
        items: response,
        nextToken: compCustomUserTypesResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(compCustomUserTypesResult.LastEvaluatedKey)
            ).toString("base64")
          : null,
      };
    } else {
      return {
        items: [],
        nextToken: null,
      };
    }
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(response);
  }
  return response;
}

const resolvers = {
  Company: {
    users: async (ctx) => {
      return listCompUsers(ctx);
    },
    matters: async (ctx) => {
      return listCompMatters(ctx);
    },
    clients: async (ctx) => {
      return listCompClients(ctx);
    },
    clientMatters: async (ctx) => {
      return listCompClientMatters(ctx);
    },
    gmailMessages: async (ctx) => {
      return listCompGmailMessages(ctx);
    },
    gmailToken: async (ctx) => {
      return getCompGmailToken(ctx);
    },
    customUserTypes: async (ctx) => {
      return listCompCustomUserTypes(ctx);
    },
  },
};

exports.handler = async (ctx) => {
  console.log("~aqs.watch:: run company >>", ctx.info.fieldName, ctx.arguments);
  const typeHandler = resolvers[ctx.info.parentTypeName];
  if (typeHandler) {
    const resolver = typeHandler[ctx.info.fieldName];
    if (resolver) {
      return await resolver(ctx);
    }
  }
  throw new Error("Resolver not found.");
};
