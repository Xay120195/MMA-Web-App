const { listThreads } = require("./gmail");

const resolvers = {
  Query: {
    threadsFromApi: async (event) => {
      return await listThreads(event);
    },
  },
};

exports.handler = async (event) => {
  console.log({ event });
  const typeHandler = resolvers[event.typeName];
  if (typeHandler) {
    const resolver = typeHandler[event.fieldName];
    if (resolver) {
      return await resolver(event);
    }
  }
  throw new Error("Resolver not found.");
};
