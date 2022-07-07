const client = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

async function listGmailMessageClientMatters(ctx) {
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;
  try {
    const gmailClientMattersParam = {
      TableName: "GmailMessageClientMatterTable",
      IndexName: "byGmailMessage",
      KeyConditionExpression: "gmailMessageId = :gmailMessageId",
      ExpressionAttributeValues: marshall({
        ":gmailMessageId": id,
      }),
      ScanIndexForward: false,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };

    if (limit !== undefined) {
      gmailClientMattersParam.Limit = limit;
    }

    const gmailClientMattersCmd = new QueryCommand(gmailClientMattersParam);
    const gmailClientMattersResult = await client.send(gmailClientMattersCmd);

    const clientMatterIds = gmailClientMattersResult.Items.map((i) =>
      unmarshall(i)
    ).map((f) => marshall({ id: f.clientMatterId }));

    if (clientMatterIds.length !== 0) {
      const clientMattersParam = {
        RequestItems: {
          ClientMatterTable: {
            Keys: clientMatterIds,
          },
        },
      };

      const clientMattersCmd = new BatchGetItemCommand(clientMattersParam);
      const clientMattersResult = await client.send(clientMattersCmd);

      const objClientMatters =
        clientMattersResult.Responses.ClientMatterTable.map((i) =>
          unmarshall(i)
        );
      const objCompClientMatters = gmailClientMattersResult.Items.map((i) =>
        unmarshall(i)
      );

      const response = objCompClientMatters.map((item) => {
        const filterMatter = objClientMatters.find(
          (u) => u.id === item.clientMatterId
        );
        return { ...item, ...filterMatter };
      });

      return {
        items: response,
        nextToken: gmailClientMattersResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(gmailClientMattersResult.LastEvaluatedKey)
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

async function listGmailMessageAttachments(ctx) {
  const { id } = ctx.source;

  try {
    const gmailAttachmentsParam = {
      TableName: "GmailMessageAttachment",
      IndexName: "byMessage",
      KeyConditionExpression: "messageId = :messageId",
      ExpressionAttributeValues: marshall({
        ":messageId": id,
      }),
    };

    const gmailAttachmentsCmd = new QueryCommand(gmailAttachmentsParam);
    const gmailAttachmentsResult = await client.send(gmailAttachmentsCmd);

    const response = gmailAttachmentsResult.Items.map((i) => unmarshall(i));

    return {
      items: response,
    };
  } catch (e) {
    response = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(response);
  }
  return response;
}

async function listGmailPayload(ctx) {
  const { id } = ctx.source;

  try {
    const gmailPayloadParam = {
      TableName: "GmailPayloadTable",
      IndexName: "byMessage",
      KeyConditionExpression: "messageId = :messageId",
      ExpressionAttributeValues: marshall({
        ":messageId": id,
      }),
    };

    const gmailPayloadCmd = new QueryCommand(gmailPayloadParam);
    const gmailPayloadResult = await client.send(gmailPayloadCmd);

    const objGmailPayload = gmailPayloadResult.Items.map((i) => unmarshall(i));

    const response = objGmailPayload.sort(function (a, b) {
      return a.order < b.order ? -1 : 1; // ? -1 : 1 for ascending/increasing order
    });

    return response;
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
  GmailMessage: {
    clientMatters: async (ctx) => {
      return listGmailMessageClientMatters(ctx);
    },
    attachments: async (ctx) => {
      return listGmailMessageAttachments(ctx);
    },
    payload: async (ctx) => {
      return listGmailPayload(ctx);
    },
  },
};

exports.handler = async (ctx) => {
  console.log("~aqs.watch:: run gmailMessage >>", ctx.info.fieldName);
  console.log("~aqs.watch:: arguments >>", ctx.arguments);
  const typeHandler = resolvers[ctx.info.parentTypeName];
  if (typeHandler) {
    const resolver = typeHandler[ctx.info.fieldName];
    if (resolver) {
      return await resolver(ctx);
    }
  }
  throw new Error("Resolver not found.");
};
