const {
  generatePresignedUrl,
  listFileLabels,
  listFileBackgrounds,
} = require("../../../services/MatterFileService");

const resolvers = {
  File: {
    downloadURL: async (ctx) => {
      return generatePresignedUrl(
        ctx.source.s3ObjectKey,
        ctx.source,
        "file-bucket"
      );
    },
    labels: async (ctx) => {
      return listFileLabels(ctx);
    },
    backgrounds: async (ctx) => {
      return listFileBackgrounds(ctx);
    },
  },
};

exports.handler = async (ctx) => {
  console.log("~aqs.watch:: run file >>", ctx.info.fieldName, ctx.arguments);
  const typeHandler = resolvers[ctx.info.parentTypeName];
  if (typeHandler) {
    const resolver = typeHandler[ctx.info.fieldName];
    if (resolver) {
      return await resolver(ctx);
    }
  }
  throw new Error("Resolver not found.");
};
