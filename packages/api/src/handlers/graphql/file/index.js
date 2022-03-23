const { generatePresignedUrl } = require("../../../services/MatterService");

const resolvers = {
  File: {
    downloadURL: async (ctx) => {
      return generatePresignedUrl("public/" + ctx.source.s3ObjectKey, ctx.source);
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
