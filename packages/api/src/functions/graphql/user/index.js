const { listUserClientMatter } = require("../../../services/UserService");

const resolvers = {
  User: {
    clientMatters: async (ctx) => {
      return listUserClientMatter(ctx);
    },
  },
};

exports.handler = async (ctx) => {
  console.log("~aqs.watch:: run user >>", ctx.info.fieldName, ctx.arguments);
  const typeHandler = resolvers[ctx.info.parentTypeName];
  if (typeHandler) {
    const resolver = typeHandler[ctx.info.fieldName];
    if (resolver) {
      return await resolver(ctx);
    }
  }
  throw new Error("Resolver not found.");
};
