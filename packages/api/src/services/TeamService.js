import ddbClient from "../lib/dynamodb-client";
const {
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
  DeleteItemCommand,
  BatchGetItemCommand,
  BatchWriteItemCommand,
} = require("@aws-sdk/client-dynamodb");
import { v4 } from "uuid";
const { toUTC } = require("../shared/toUTC");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

export async function getTeam(data) {
  let resp = {};
  try {
    const param = {
      TableName: "TeamTable",
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

export async function listTeams() {
  let resp = {};
  try {
    const param = {
      TableName: "TeamTable",
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

export async function createTeam(data) {
  let resp = {};
  try {
    const rawParams = {
      id: v4(),
      name: data.name,
      createdAt: toUTC(new Date()),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "TeamTable",
      Item: param,
    });

    const request = await ddbClient.send(cmd);

    if (request) {
      const companyTeamParams = {
        id: v4(),
        teamId: rawParams.id,
        companyId: data.companyId,
        createdAt: toUTC(new Date()),
      };

      const companyTeamCommand = new PutItemCommand({
        TableName: "CompanyTeamTable",
        Item: marshall(companyTeamParams),
      });

      const companyTeamRequest = await ddbClient.send(companyTeamCommand);
      resp = companyTeamRequest
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

export async function updateTeam(id, data) {
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
      TableName: "TeamTable",
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

export async function deleteTeam(id) {
  let resp = {};
  try {
    const companyTeamParams = {
      TableName: "CompanyTeamTable",
      IndexName: "byTeam",
      KeyConditionExpression: "teamId = :teamId",
      ExpressionAttributeValues: marshall({
        ":teamId": id,
      }),
      ProjectionExpression: "id", // fetch id of CompanyTeamTable only
    };

    const companyTeamCmd = new QueryCommand(companyTeamParams);
    const companyTeamResult = await ddbClient.send(companyTeamCmd);

    const companyTeamId = companyTeamResult.Items[0];

    const deleteCompanyTeamCommand = new DeleteItemCommand({
      TableName: "CompanyTeamTable",
      Key: companyTeamId,
    });

    const deleteCompanyTeamResult = await ddbClient.send(
      deleteCompanyTeamCommand
    );

    if (deleteCompanyTeamResult) {
      const cmd = new DeleteItemCommand({
        TableName: "TeamTable",
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

export async function tagTeamMember(data) {
  let resp = {};

  try {
    const arrItems = [];

    const teamMembersParams = {
      TableName: "TeamMemberTable",
      IndexName: "byTeam",
      KeyConditionExpression: "teamId = :teamId",
      ExpressionAttributeValues: marshall({
        ":teamId": data.teamId,
      }),
      ProjectionExpression: "id",
    };

    const teamMembersCmd = new QueryCommand(teamMembersParams);
    const teamMembersRes = await ddbClient.send(teamMembersCmd);

    if (teamMembersRes.Count !== 0) {
      for (var a = 0; a < teamMembersRes.Items.length; a++) {
        var teamMembersId = {
          id: teamMembersRes.Items[a].id,
        };
        arrItems.push({
          DeleteRequest: {
            Key: teamMembersId,
          },
        });
      }
    }

    for (var i = 0; i < data.members.length; i++) {
      var uuid = v4();
      arrItems.push({
        PutRequest: {
          Item: marshall({
            id: uuid,
            teamId: data.teamId,
            memberId: data.members[i].userId,
            usertype: data.members[i].userType
              ? data.members[i].userType
              : null,
            customUserType: data.members[i].customUserType
              ? data.members[i].customUserType
              : null,
            createdAt: toUTC(new Date()),
          }),
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

    batches.forEach(async (data) => {
      const teamMemberParams = {
        RequestItems: {
          TeamMemberTable: data,
        },
      };

      const teamMemberCmd = new BatchWriteItemCommand(teamMemberParams);
      await ddbClient.send(teamMemberCmd);
    });

    resp = { id: data.teamId };
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

export async function listTeamMembers(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;

  try {
    const teamMembersParams = {
      TableName: "TeamMemberTable",
      IndexName: "byTeam",
      KeyConditionExpression: "teamId = :teamId",
      ExpressionAttributeValues: marshall({
        ":teamId": id,
      }),

      ScanIndexForward: false,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      teamMembersParams.Limit = limit;
    }

    const teamMembersCmd = new QueryCommand(teamMembersParams);
    const teamMembersResult = await ddbClient.send(teamMembersCmd);

    const userIds = teamMembersResult.Items.map((i) => unmarshall(i)).map((f) =>
      marshall({ id: f.memberId })
    );

    if (userIds.length !== 0) {
      const membersParam = {
        RequestItems: {
          UserTable: {
            Keys: userIds,
          },
        },
      };

      const membersCmd = new BatchGetItemCommand(membersParam);
      const membersResult = await ddbClient.send(membersCmd);

      const objMembers = membersResult.Responses.UserTable.map((i) =>
        unmarshall(i)
      );

      const objTeamMembers = teamMembersResult.Items.map((i) => unmarshall(i));

      const response = objTeamMembers
        .map((item) => {
          const filterMember = objMembers.find((u) => u.id === item.memberId);

          if (filterMember !== undefined) {
            return { ...item, ...{ user: filterMember } };
          }
        })
        .filter((a) => a !== undefined);

      return {
        items: response,
        nextToken: teamMembersResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(teamMembersResult.LastEvaluatedKey)
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
    res = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(res);
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
