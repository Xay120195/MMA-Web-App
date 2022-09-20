import ddbClient from "../lib/dynamodb-client";
const {
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  QueryCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  BatchGetItemCommand,
  BatchWriteItemCommand
} = require("@aws-sdk/client-dynamodb");
import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminUpdateUserAttributesCommand
} from "@aws-sdk/client-cognito-identity-provider";

import identityClient from "../lib/cognito-identity-provider-client";
import randomString from "../shared/randomString";
const { v4 } = require("uuid");
const { toUTC } = require("../shared/toUTC");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

export async function getUser(data) {
  let resp = {};
  try {
    const param = {
      TableName: "UserTable",
      Key: marshall({
        id: data.id
      })
    };

    const cmd = new GetItemCommand(param);
    const { Item } = await ddbClient.send(cmd);
    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack
    };
  }

  return resp;
}

export async function listUsers() {
  let resp = {};
  try {
    const param = {
      TableName: "UserTable"
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack
    };
    console.log(resp);
  }

  return resp;
}

export async function listUserClientMatterAccess(ctx) {
  const { id } = ctx.source;
  const { companyId, limit, nextToken } = ctx.arguments;

  let indexName = "byUser",
    isAscending = false,
    response = {};

  try {
    const userClientMatterParams = {
      TableName: "UserClientMatterTable",
      IndexName: indexName,
      KeyConditionExpression: "userId = :userId",
      FilterExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall({
        ":userId": id,
        ":companyId": companyId
      }),

      ScanIndexForward: isAscending,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined
    };

    if (limit !== undefined) {
      userClientMatterParams.Limit = limit;
    }

    const userClientMatterCommand = new QueryCommand(userClientMatterParams);

    const userClientMatterResult = await ddbClient.send(userClientMatterCommand);

    const clientMatterIds = userClientMatterResult.Items.map((i) => unmarshall(i)).map((f) =>
      marshall({ id: f.clientMatterId })
    );

    if (clientMatterIds.length !== 0) {
      let unique = clientMatterIds
        .map((a) => unmarshall(a))
        .map((x) => x.id)
        .filter(function (item, i, ar) {
          return ar.indexOf(item) === i;
        });

      const uniqueClientMatterIds = unique.map((f) => marshall({ id: f }));

      const clientMattersParams = {
        RequestItems: {
          ClientMatterTable: {
            Keys: uniqueClientMatterIds
          }
        }
      };

      const clientMattersCommand = new BatchGetItemCommand(clientMattersParams);
      const clientMattersResult = await ddbClient.send(clientMattersCommand);

      const objClientMatters = clientMattersResult.Responses.ClientMatterTable.map((i) =>
        unmarshall(i)
      );

      const objUserClientMatter = userClientMatterResult.Items.map((i) => unmarshall(i));

      const response = objUserClientMatter
        .map((item) => {
          const filterClientMatter = objClientMatters.find((u) => u.id === item.clientMatterId);

          if (filterClientMatter !== undefined) {
            return { ...item, ...{ clientMatter: filterClientMatter } };
          }
        })
        .filter((a) => a !== undefined);

      return {
        items: response,
        nextToken: userClientMatterResult.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(userClientMatterResult.LastEvaluatedKey)).toString("base64")
          : null
      };
    } else {
      return {
        items: [],
        nextToken: null
      };
    }
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack
    };
    console.log(resp);
  }
  return response;
}

export async function tagUserClientMatter(data) {
  let resp = {};

  console.log("tagUserClientMatter()");
  try {
    const arrItems = [];
    const arrResponse = [];

    const userClientMatterIdParams = {
      TableName: "UserClientMatterTable",
      IndexName: "byUser",
      KeyConditionExpression: "userId = :userId",
      FilterExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall({
        ":userId": data.userId,
        ":companyId": data.companyId
      }),
      ProjectionExpression: "id"
    };

    const userClientMatterIdCmd = new QueryCommand(userClientMatterIdParams);

    const userClientMatterIdRes = await ddbClient.send(userClientMatterIdCmd);

    if (userClientMatterIdRes.Count !== 0) {
      for (var a = 0; a < userClientMatterIdRes.Items.length; a++) {
        var userClientMatterId = {
          id: userClientMatterIdRes.Items[a].id
        };
        arrItems.push({
          DeleteRequest: {
            Key: userClientMatterId
          }
        });
      }
    }

    for (var i = 0; i < data.clientMatterAccess.length; i++) {
      const { clientMatterId, userType, customUserType } = data.clientMatterAccess[i];

      const params = {
        id: v4(),
        userId: data.userId,
        companyId: data.companyId,
        clientMatterId: clientMatterId,
        userType: userType ? userType : null,
        customUserType: customUserType ? customUserType : null
      };
      arrResponse.push(params);
      arrItems.push({
        PutRequest: {
          Item: marshall(params)
        }
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
          UserClientMatterTable: data
        }
      };

      const userClientMatterCmd = new BatchWriteItemCommand(userClientMatterParams);
      await ddbClient.send(userClientMatterCmd);
    });

    resp = arrResponse;
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack
    };
    console.log(resp);
  }

  return resp;
}

export async function tagAllUserClientMatter(data) {
  let resp = {};

  try {
    const compCMParam = {
      TableName: "CompanyClientMatterTable",
      IndexName: "byCompany",
      KeyConditionExpression: "companyId = :companyId",
      ExpressionAttributeValues: marshall({
        ":companyId": data.companyId
      }),
      ProjectionExpression: "clientMatterId"
    };

    const compCMCmd = new QueryCommand(compCMParam);
    const compCMResult = await ddbClient.send(compCMCmd);

    const clientMatterIds = compCMResult.Items.map((i) => unmarshall(i));

    const clientMatterAccess = clientMatterIds.map((cmi) => {
      const item = {
        ...cmi
      };

      if (data.userType) {
        item.userType = data.userType;
      }

      if (data.customUserType) {
        item.customUserType = data.customUserType;
      }

      return item;
    });

    const userClientMatterParams = {
      userId: data.userId,
      companyId: data.companyId,
      clientMatterAccess: clientMatterAccess
    };

    return tagUserClientMatter(userClientMatterParams);
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack
    };
    console.log(resp);
  }
}

export async function untagUserClientMatter(data) {
  let resp = {};

  try {
    const userClientMatterIdParams = {
      TableName: "UserClientMatterTable",
      IndexName: "byUser",
      KeyConditionExpression: "userId = :userId",
      FilterExpression: "clientMatterId = :clientMatterId",
      ExpressionAttributeValues: marshall({
        ":userId": data.userId,
        ":clientMatterId": data.clientMatterId
      }),
      ProjectionExpression: "id"
    };

    const userClientMatterIdCmd = new QueryCommand(userClientMatterIdParams);
    const userClientMatterIdRes = await ddbClient.send(userClientMatterIdCmd);

    let userClientMatterId = userClientMatterIdRes.Items.map((a) => unmarshall(a))
      .map((x) => x.id)
      .filter(function (item, i, ar) {
        return ar.indexOf(item) === i;
      });

    if (userClientMatterId.length !== 0) {
      const cmd = new DeleteItemCommand({
        TableName: "UserClientMatterTable",
        Key: marshall({ id: userClientMatterId[0] })
      });
      await ddbClient.send(cmd);
    }

    resp = { id: userClientMatterId[0] };
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack
    };
    console.log(resp);
  }

  return resp;
}

export async function listUserTeams(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;

  try {
    const userTeamsParam = {
      TableName: "TeamMemberTable",
      IndexName: "byMember",
      KeyConditionExpression: "memberId = :memberId",
      ExpressionAttributeValues: marshall({
        ":memberId": id
      }),
      ScanIndexForward: false,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined
    };

    if (limit !== undefined) {
      userTeamsParam.Limit = limit;
    }

    const userTeamsCmd = new QueryCommand(userTeamsParam);
    const userTeamsResult = await ddbClient.send(userTeamsCmd);
    const teamIds = userTeamsResult.Items.map((i) => unmarshall(i)).map((f) =>
      marshall({ id: f.teamId })
    );

    if (teamIds.length !== 0) {
      const teamsParam = {
        RequestItems: {
          TeamTable: {
            Keys: teamIds
          }
        }
      };

      const teamsCmd = new BatchGetItemCommand(teamsParam);
      const teamsResult = await ddbClient.send(teamsCmd);

      const objTeams = teamsResult.Responses.TeamTable.map((i) => unmarshall(i));
      const objCompTeams = userTeamsResult.Items.map((i) => unmarshall(i));

      const response = objCompTeams
        .map((item) => {
          const filterTeam = objTeams.find((u) => u.id === item.teamId);

          if (filterTeam !== undefined) {
            return { ...item, ...filterTeam };
          }
        })
        .filter((a) => a !== undefined);

      return {
        items: response,
        nextToken: userTeamsResult.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(userTeamsResult.LastEvaluatedKey)).toString("base64")
          : null
      };
    } else {
      return {
        items: [],
        nextToken: null
      };
    }
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack
    };
    console.log(resp);
  }
  return response;
}

export async function createUser(data) {
  let resp = {};
  try {
    const rawParams = {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      userType: data.userType ? data.userType : null,
      company: data.company,
      createdAt: toUTC(new Date()),
      customUserType: data.customUserType ? data.customUserType : null
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "UserTable",
      Item: param
    });

    const request = await ddbClient.send(cmd);

    const compUserParam = {
      id: v4(),
      userId: data.id,
      companyId: data.company.id,
      createdAt: toUTC(new Date())
    };
    const putCompUserCmd = new PutItemCommand({
      TableName: "CompanyUserTable",
      Item: marshall(compUserParam)
    });

    await ddbClient.send(putCompUserCmd);

    resp = request ? unmarshall(param) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack
    };
  }
  return resp;
}

export async function deleteUser(userId, companyId, email) {
  let resp = {};

  try {
    const compUsersParam = {
      TableName: "CompanyUserTable",
      IndexName: "byUser",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: marshall({
        ":userId": userId
      })
    };

    const compUsersCmd = new QueryCommand(compUsersParam);
    const compUsersResult = await ddbClient.send(compUsersCmd);

    const compUsersItems = compUsersResult.Items.map((i) => unmarshall(i));

    const compUsersItemsCnt = compUsersResult.Count;

    if (compUsersItemsCnt == 1) {
      // delete from cognito users
      // delete from users table

      await deleteCognitoUser({
        UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
        Username: email
      });

      const cmd = new DeleteItemCommand({
        TableName: "UserTable",
        Key: marshall({ id: userId })
      });
      await ddbClient.send(cmd);
    }

    const filterByCompanyId = compUsersItems.filter((u) => u.companyId === companyId);

    if (filterByCompanyId.length != 0) {
      const companyUserId = {
        id: filterByCompanyId[0].id
      };

      const companyUserCmd = new DeleteItemCommand({
        TableName: "CompanyUserTable",
        Key: marshall(companyUserId)
      });
      await ddbClient.send(companyUserCmd);
    }

    resp = { id: userId };
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack
    };
    console.log(resp);
  }

  return resp;
}

export async function updateUser(id, data) {
  let resp = {};

  try {
    const { ExpressionAttributeNames, ExpressionAttributeValues, UpdateExpression } =
      getUpdateExpressions(data);

    const param = {
      id,
      ...data
    };

    const cmd = new UpdateItemCommand({
      TableName: "UserTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues
    });
    await ddbClient.send(cmd);

    const cognitoUserUpdate = await updateCognitoUser({
      UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      Username: data.email,
      UserAttributes: [
        {
          Name: "given_name",
          Value: data.firstName
        },
        {
          Name: "family_name",
          Value: data.lastName
        }
      ]
    });

    resp = param;
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack
    };
    console.log(resp);
  }
  return resp;
}

export async function inviteUser(data) {
  const user = await createCognitoUser({
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    Username: data.email,
    DesiredDeliveryMediums: ["EMAIL"],
    TemporaryPassword: randomString(),
    UserAttributes: [
      {
        Name: "email",
        Value: data.email
      },
      {
        Name: "email_verified",
        Value: "true"
      }
    ]
  });

  data.id = user.id;
  return createUser(data);
}

async function createCognitoUser(input) {
  const cmd = new AdminCreateUserCommand(input);
  const resp = await identityClient.send(cmd);
  const id = resp.User.Attributes.filter((attrib) => attrib.Name === "sub")[0].Value;
  resp.id = id;
  return resp;
}

async function deleteCognitoUser(input) {
  const cmd = new AdminDeleteUserCommand(input);
  const resp = await identityClient.send(cmd);
  return resp;
}

async function updateCognitoUser(input) {
  const cmd = new AdminUpdateUserAttributesCommand(input);
  const resp = await identityClient.send(cmd);
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
    ExpressionAttributeValues: marshall(values)
  };
}
