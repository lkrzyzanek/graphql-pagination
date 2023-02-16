const { initDb, knexDestroy, createApolloServer } = require("../server");

describe("example-sql-knex", () => {

  let testServer;

  beforeAll(async () => {
    testServer = createApolloServer();
    await initDb();
  });

  afterAll(async () => await knexDestroy());

  it("booksAsc", async () => {
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

    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data.booksAsc.totalCount).toBe(100);
    expect(response.body.singleResult.data.booksAsc.edges[0].node.id).toBe("1");
  });

  it("booksDesc", async () => {
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

    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data.booksDesc.totalCount).toBe(100);
    expect(response.body.singleResult.data.booksDesc.edges[0].node.id).toBe("100");
  });

  it("booksAsc-author", async () => {
    const response = await testServer.executeOperation({
      query: /*GraphQL*/`
          query BooksAscTest {
            booksAsc(author: "Author 5", first: 100) {
              totalCount
              edges {
                node {
                  id
                  author
                }
              }
            }
          }
          `,
    });

    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data.booksAsc.totalCount).toBe(10);
    expect(response.body.singleResult.data.booksAsc.edges[0].node.author).toBe("Author 5");
  });

});
