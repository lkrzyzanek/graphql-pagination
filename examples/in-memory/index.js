const { createApolloServer } = require("./server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const server = createApolloServer();

startStandaloneServer(server).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
