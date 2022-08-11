import ddbClient from "../lib/dynamodb-client";
const {
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
  DeleteItemCommand,
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
