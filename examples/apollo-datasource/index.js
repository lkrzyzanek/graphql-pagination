const { createApolloServer } = require("./server");

const server = createApolloServer();

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
