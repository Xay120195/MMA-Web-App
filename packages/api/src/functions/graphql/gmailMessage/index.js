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

async function getGmailMessagePDF(ctx) {
  const { id } = ctx.source;

  try {
    const gmailPDFParam = {
      TableName: "GmailMessagePDF",
      IndexName: "byMessage",
      KeyConditionExpression: "messageId = :messageId",
      ExpressionAttributeValues: marshall({
        ":messageId": id,
      }),
    };

    const gmailPDFCmd = new QueryCommand(gmailPDFParam);
    const { Items } = await client.send(gmailPDFCmd);

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

const resolvers = {
  GmailMessage: {
    clientMatters: async (ctx) => {
      return listGmailMessageClientMatters(ctx);
    },
    attachments: async (ctx) => {
      return listGmailMessageAttachments(ctx);
    },
    pdfVersion: async (ctx) => {
      return getGmailMessagePDF(ctx);
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
