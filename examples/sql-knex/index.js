const { createApolloServer, initDb } = require("./server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const server = createApolloServer();

initDb()
    .then(() => startStandaloneServer(server))
    .then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    });
