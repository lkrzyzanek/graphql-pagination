const { initDb, knexDestroy, createApolloServer } = require("../server");

describe("example-sql-knex", () => {

  it("booksAsc-query", async () => {
    await initDb();
    const testServer = createApolloServer();

    const response = await testServer.executeOperation({
      query: /*GraphQL*/`
        query BooksAscTest {
          booksAsc {
            totalCount
          }
        }
        `,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data.booksAsc.totalCount).toBe(100);

    await knexDestroy();
  });

});
