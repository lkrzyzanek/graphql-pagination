const { createApolloServer, initDb } = require("./server");

const server = createApolloServer();

initDb()
  .then(() => server.listen())
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
