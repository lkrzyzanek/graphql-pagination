const { createApolloServer } = require("../server");

describe("example-apollo-ds", () => {

  it("booksAsc-query", async () => {
    const testServer = createApolloServer();

    const response = await testServer.executeOperation({
      query: /*GraphQL*/`
          query BooksAscTest {
            booksAsc {
              totalCount
              edges {
                node {
                  id
                }
              }
            }
          }
          `,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data.booksAsc.totalCount).toBe(100);
    expect(response.data.booksAsc.edges[0].node.id).toBe("1");
  });

  it("booksDesc-query", async () => {
    const testServer = createApolloServer();

    const response = await testServer.executeOperation({
      query: /*GraphQL*/`
          query BooksAscTest {
            booksDesc {
              totalCount
              edges {
                node {
                  id
                }
              }
            }
          }
          `,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data.booksDesc.totalCount).toBe(100);
    expect(response.data.booksDesc.edges[0].node.id).toBe("100");
  });

});
