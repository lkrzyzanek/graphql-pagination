const { createApolloServer, dataSource } = require("../server");
const { dataSourceLoaderPager } = require("@graphql-pagination/core");

describe("example-in-memory", () => {

    let testServer;
    const contextValue = {
        pagerDataloader: dataSourceLoaderPager({ dataSource }),
    };
    beforeAll(() => {
        testServer = createApolloServer();
    });

    const queries = ["booksAsc", "booksDesc", "booksPublishedAsc", "booksPublishedDesc", "booksByTitle", "booksByAuthor", "booksByOffset", "booksDynamic"];

    it.each(queries)("query %s", async (queryName) => {
        const response = await testServer.executeOperation({
            query: /* GraphQL */ `
                query Test {
                    books: ${queryName} {
                    totalCount
                        edges {
                            cursor
                            node {
                                id
                            }
                        } 
                    }
                }
            `,
        }, { contextValue });

        expect(response.body.singleResult.errors).toBeUndefined();
        const books = response.body.singleResult.data.books;

        expect(books.totalCount).toBe(100);
        expect(books.edges[0].cursor).not.toBeUndefined();
        expect(books.edges[0].node.id).not.toBeUndefined();
    });

    test("error-bad cursor", async () => {
        const response = await testServer.executeOperation({
            query: /* GraphQL */`
                query Test {
                    booksAsc(after: "bad") {
                        totalCount
                    }
                }
        `,
        }, { contextValue });

        expect(response.body.singleResult.errors[0].message).toBe("Invalid cursor value");
        expect(response.body.singleResult.errors[0].extensions.code).toBe("BAD_USER_INPUT");
    });
    test("error-bad query", async () => {
        const response = await testServer.executeOperation({
            query: /* GraphQL */ `
                query Test {
                    badquery
                }
            `,
        }, { contextValue });

        expect(response.body.singleResult.errors[0].message).toBe("Cannot query field \"badquery\" on type \"Query\".");
    });

    test("error-bad author", async () => {
        const response = await testServer.executeOperation({
            query: /* GraphQL */`
                query Test {
                    booksByAuthor(author: "bad name") {
                        totalCount
                    }
                }
        `,
        }, { contextValue });

        expect(response.body.singleResult.errors[0].message).toBe("Author bad name not exists");
    });

    test("error-bad author", async () => {
        const response = await testServer.executeOperation({
            query: /* GraphQL */ `
            query Test {
                booksByTitle(title: "bad name") {
                    totalCount
                }
            }
        `,
        }, { contextValue });

        expect(response.body.singleResult.errors[0].message).toBe("Title bad name not exists");
    });

    test("filter-author", async () => {
        const response = await testServer.executeOperation({
            query: /* GraphQL */`
            query Test {
                books: booksByAuthor(author: "Author 5") {
                    totalCount
                }
            }
        `,
        }, { contextValue });

        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data.books.totalCount).toBe(10);
    });

    test("filter-author", async () => {
        const response = await testServer.executeOperation({
            query: /* GraphQL */ `
                query Test {
                    books: booksByAuthor(author: "Author 5", first: 100) {
                        totalCount
                    }
                }
        `,
        }, { contextValue });

        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data.books.totalCount).toBe(10);
    });

    test("filter-title", async () => {
        const response = await testServer.executeOperation({
            query: /* GraphQL */`
                query Test {
                    books: booksByTitle(title: "Book 3") {
                        totalCount
                    }
                }
        `,
        }, { contextValue });

        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data.books.totalCount).toBe(1);
    });

});
