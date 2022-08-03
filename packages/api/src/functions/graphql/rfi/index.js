const { listRFIRequests } = require("../../../services/RFIService");

const resolvers = {
  RFI: {
    requests: async (ctx) => {
      return listRFIRequests(ctx);
    },
  },
};

exports.handler = async (ctx) => {
  console.log("~aqs.watch:: run rfi >>", ctx.info.fieldName, ctx.arguments);
  const typeHandler = resolvers[ctx.info.parentTypeName];
  if (typeHandler) {
    const resolver = typeHandler[ctx.info.fieldName];
    if (resolver) {
      return await resolver(ctx);
    }
  }
  throw new Error("Resolver not found.");
};
