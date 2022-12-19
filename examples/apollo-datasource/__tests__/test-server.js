const { createApolloServer } = require("../server");

describe("example-apollo-ds", () => {

  it("booksAsc-query", async () => {
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
  });

});
