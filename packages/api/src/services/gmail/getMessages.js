const { docClient } = require("./lib");

exports.getMessages = async (ctx) => {
  try {
    const { email, subject, content, recipient, startDate, endDate } =
      ctx.arguments;

    const ExpressionAttributeValues = {},
      FilterExpression = [];

    if (subject) {
      ExpressionAttributeValues[":subject"] = subject.toLowerCase();
      FilterExpression.push("contains(lower_subject, :subject)");
    }

    if (content) {
      ExpressionAttributeValues[":content"] = content.toLowerCase();
      FilterExpression.push("contains(lower_snippet, :content)");
    }

    if (recipient) {
      ExpressionAttributeValues[":recipient"] = recipient.toLowerCase();
      FilterExpression.push("contains(recipient, :recipient)");
    }

    if (startDate) {
      ExpressionAttributeValues[":startDate"] = new Date(startDate).getTime();
      FilterExpression.push("receivedAt >= :startDate");
    }

    if (endDate) {
      ExpressionAttributeValues[":endDate"] = new Date(endDate).getTime();
      FilterExpression.push("receivedAt <= :endDate");
    }

    const params = {};
    if (
      Object.keys(ExpressionAttributeValues).length &&
      FilterExpression.length
    ) {
      params["ExpressionAttributeValues"] = ExpressionAttributeValues;
      params["FilterExpression"] = FilterExpression.join(" AND ");
    }

    const { Items } = await docClient
      .scan({
        TableName: "gmailMessages",
        Key: { connectedEmail: email },
        ...params,
      })
      .promise();
    return Items;
  } catch ({ message }) {
    console.log("errMessage:", message);
  }
};
