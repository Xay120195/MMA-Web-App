const client = require("../../../lib/dynamodb-client");
const {
  QueryCommand,
  BatchGetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { generatePresignedUrl } = require("../../../services/MatterService");
async function listGmailAttachmentLabels(ctx) {
  
  const { id } = ctx.source;
  const { limit, nextToken } = ctx.arguments;
  try {
    const gmailLabelsParam = {
      TableName: "GmailAttachmentLabelTable",
      IndexName: "byGmailAttachment",
      KeyConditionExpression: "attachmentId = :attachmentId",
      ExpressionAttributeValues: marshall({
        ":attachmentId": id,
      }),
      ScanIndexForward: false,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"))
        : undefined,
    };
    if (limit !== undefined) {
      gmailLabelsParam.Limit = limit;
    }
    const gmailLabelsCmd = new QueryCommand(gmailLabelsParam);
    const gmailLabelsResult = await client.send(gmailLabelsCmd);
    const labelIds = gmailLabelsResult.Items.map((i) => unmarshall(i)).map(
      (f) => marshall({ id: f.labelId })
    );
    if (labelIds.length !== 0) {
      const labelsParam = {
        RequestItems: {
          LabelsTable: {
            Keys: labelIds,
          },
        },
      };
      const labelsCmd = new BatchGetItemCommand(labelsParam);
      const labelsResult = await client.send(labelsCmd);
      const objLabels = labelsResult.Responses.LabelsTable.map((i) =>
        unmarshall(i)
      );
      const objGmailLabels = gmailLabelsResult.Items.map((i) => unmarshall(i));
      const response = objGmailLabels
        .map((item) => {
          const filterMatter = objLabels.find((u) => u.id === item.labelId);
          if (filterMatter !== undefined) {
            return { ...item, ...filterMatter };
          }
        })
        .filter((a) => a !== undefined);
      return {
        items: response,
        nextToken: gmailLabelsResult.LastEvaluatedKey
          ? Buffer.from(
              JSON.stringify(gmailLabelsResult.LastEvaluatedKey)
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
  GmailMessageAttachment: {
    downloadURL: async (ctx) => {
      return generatePresignedUrl(
        ctx.source.s3ObjectKey,
        ctx.source
      );
    },
    labels: async (ctx) => {
      return listGmailAttachmentLabels(ctx);
    },
  },
};

exports.handler = async (ctx) => {
  console.log("~aqs.watch:: run gmailAttachment >>", ctx.info.fieldName);
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
