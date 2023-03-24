const { createApolloServer, dataSource } = require("./server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { dataSourceLoaderPager } = require("@graphql-pagination/core");

const server = createApolloServer();

startStandaloneServer(server, {
  context: () => ({
    pagerDataloader: dataSourceLoaderPager({ dataSource }),
  }),
}).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
