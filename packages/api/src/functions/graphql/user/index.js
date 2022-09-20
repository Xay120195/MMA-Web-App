const {
  listUserClientMatterAccess,
  listUserTeams,
} = require("../../../services/UserService");
const {
  getCustomUserType,
} = require("../../../services/CustomUserTypeService");

const resolvers = {
  User: {
    clientMatterAccess: async (ctx) => {
      return listUserClientMatterAccess(ctx);
    },
    customUserType: async (ctx) => {
      const { userType, customUserType } = ctx.source;

      if (userType == null) {
        return await getCustomUserType(customUserType);
      }
    },
    teams: async (ctx) => {
      return listUserTeams(ctx);
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
