import { server } from '../server';
import { Query } from '../__generated__/resolversTypes';
import { dataSourcePager, OffsetDataSourceWrapper } from '@graphql-pagination/core';
import { createInMemoryMongoDb, createMongoClient } from "../datasources/db";
import { insertTestData, createBooksDataSource, createBooksOffsetDataSource } from "../datasources/booksApi";
import { BookType } from '../types/Book';
import { MongoDbDataSource, ObjectIdCursorEncoderDecoder, MongoDbOffsetDataSource } from '@graphql-pagination/mongodb';
import assert from 'node:assert';
import { MongoClient, Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Books GraphQL API', () => {
    jest.setTimeout(30_000);

    let dataSource: MongoDbDataSource<BookType>;
    let dataSourceOffset: OffsetDataSourceWrapper<BookType>;
    const cursor = new ObjectIdCursorEncoderDecoder();

    let client: MongoClient;
    let mongod: MongoMemoryServer;

    beforeAll(async () => {
        mongod = await createInMemoryMongoDb();
        client = createMongoClient(mongod.getUri());
        const mongoDb = client.db("data");
        await insertTestData(mongoDb);
        dataSource = await createBooksDataSource(mongoDb);
        dataSourceOffset = createBooksOffsetDataSource(mongoDb);
    });

    afterAll(async () => {
        await server.stop();
        if (client) await client.close();
        if (mongod) await mongod.stop();
    });

    it('Query.books', async () => {
        const query = /* GraphQL */ `
            query {
                books {
                    edges {
                        cursor
                        node {
                            id
                            title
                            author
                        }
                    }
                }
            }
        `;
        const response = await server.executeOperation<Query>({ query }, {
            contextValue: {
                booksPager: dataSourcePager({ dataSource, cursor }),
                booksOffsetPager: dataSourcePager({ dataSource: dataSourceOffset }),
            },
        });
        assert(response.body.kind === "single");
        const result = response.body.singleResult;

        expect(result.errors).toBeUndefined();

        expect(result.data?.books?.edges).toBeDefined();
        const edge0 = result.data?.books?.edges?.[0];
        expect(edge0?.cursor).toBeDefined();
        expect(edge0?.node.id).toBe("0");

        const edge1 = result.data?.books?.edges?.[1];
        expect(edge1?.cursor).toBeDefined();
        expect(edge1?.node.id).toBe("1");
    });
    it('Query.books.totalCount', async () => {
        const query = /* GraphQL */ `
            query {
                books {
                    totalCount
                }
            }
        `;
        const response = await server.executeOperation<Query>({ query }, {
            contextValue: {
                booksPager: dataSourcePager({ dataSource, cursor }),
                booksOffsetPager: dataSourcePager({ dataSource: dataSourceOffset }),
            },
        });
        assert(response.body.kind === "single");
        const result = response.body.singleResult;

        expect(result.errors).toBeUndefined();

        expect(result.data?.books?.totalCount).toBe(100);
    });
    it('Query.books.filter', async () => {
        const query = /* GraphQL */ `
            query {
                books(author: "Author 1") {
                    totalCount
                    edges {
                        cursor
                        node {
                            id
                            title
                            author
                        }
                    }
                }
            }
        `;
        const response = await server.executeOperation<Query>({ query }, {
            contextValue: {
                booksPager: dataSourcePager({ dataSource, cursor }),
                booksOffsetPager: dataSourcePager({ dataSource: dataSourceOffset }),
            },
        });
        assert(response.body.kind === "single");
        const result = response.body.singleResult;

        expect(result.errors).toBeUndefined();

        expect(result.data?.books?.edges).toBeDefined();
        const edge0 = result.data?.books?.edges?.[0];
        expect(edge0?.cursor).toBeDefined();
        expect(edge0?.node.author).toBe("Author 1");

        const edge1 = result.data?.books?.edges?.[1];
        expect(edge1?.cursor).toBeDefined();
        expect(edge1?.node.author).toBe("Author 1");

        expect(result.data?.books?.totalCount).toBe(10);
    });


    it('Query.books_desc', async () => {
        const query = /* GraphQL */ `
            query {
                books_desc {
                    edges {
                        cursor
                        node {
                            id
                            title
                            author
                        }
                    }
                }
            }
        `;
        const response = await server.executeOperation<Query>({ query }, {
            contextValue: {
                booksPager: dataSourcePager({ dataSource, cursor }),
                booksOffsetPager: dataSourcePager({ dataSource: dataSourceOffset }),
            },
        });
        assert(response.body.kind === "single");
        const result = response.body.singleResult;

        expect(result.errors).toBeUndefined();
        expect(result.data?.books_desc?.edges).toBeDefined();
        const edge0 = result.data?.books_desc?.edges?.[0];
        expect(edge0?.cursor).toBeDefined();
        expect(edge0?.node.id).toBe("99");

        const edge1 = result.data?.books_desc?.edges?.[1];
        expect(edge1?.cursor).toBeDefined();
        expect(edge1?.node.id).toBe("98");
    });
    it('Query.books_desc.totalCount', async () => {
        const query = /* GraphQL */ `
            query {
                books_desc {
                    totalCount
                }
            }
        `;
        const response = await server.executeOperation<Query>({ query }, {
            contextValue: {
                booksPager: dataSourcePager({ dataSource, cursor }),
                booksOffsetPager: dataSourcePager({ dataSource: dataSourceOffset }),
            },
        });
        assert(response.body.kind === "single");
        const result = response.body.singleResult;

        expect(result.errors).toBeUndefined();
        expect(result.data?.books_desc?.totalCount).toBe(100);
    });
    it('Query.books_desc.filter', async () => {
        const query = /* GraphQL */ `
            query {
                books_desc(author: "Author 1") {
                    totalCount
                    edges {
                        cursor
                        node {
                            id
                            title
                            author
                        }
                    }
                }
            }
        `;
        const response = await server.executeOperation<Query>({ query }, {
            contextValue: {
                booksPager: dataSourcePager({ dataSource, cursor }),
                booksOffsetPager: dataSourcePager({ dataSource: dataSourceOffset }),
            },
        });
        assert(response.body.kind === "single");
        const result = response.body.singleResult;

        expect(result.errors).toBeUndefined();

        expect(result.data?.books_desc?.edges).toBeDefined();
        const edge0 = result.data?.books_desc?.edges?.[0];
        expect(edge0?.cursor).toBeDefined();
        expect(edge0?.node.author).toBe("Author 1");

        const edge1 = result.data?.books_desc?.edges?.[1];
        expect(edge1?.cursor).toBeDefined();
        expect(edge1?.node.author).toBe("Author 1");

        expect(result.data?.books_desc?.totalCount).toBe(10);
    });

    it('Query.booksByOffset.totalCount', async () => {
        const query = /* GraphQL */ `
            query {
                booksByOffset {
                    totalCount
                }
            }
        `;
        const response = await server.executeOperation<Query>({ query }, {
            contextValue: {
                booksPager: dataSourcePager({ dataSource, cursor }),
                booksOffsetPager: dataSourcePager({ dataSource: dataSourceOffset }),
            },
        });
        assert(response.body.kind === "single");
        const result = response.body.singleResult;

        expect(result.errors).toBeUndefined();

        expect(result.data?.booksByOffset?.totalCount).toBe(100);
    });
    it('Query.booksByOffset.page2', async () => {
        const query = /* GraphQL */ `
            query {
                booksByOffset(page: 2) {
                    edges {
                        node {
                            id
                        }
                    }
                }
            }
        `;
        const response = await server.executeOperation<Query>({ query }, {
            contextValue: {
                booksPager: dataSourcePager({ dataSource, cursor }),
                booksOffsetPager: dataSourcePager({ dataSource: dataSourceOffset }),
            },
        });
        assert(response.body.kind === "single");
        const result = response.body.singleResult;

        expect(result.errors).toBeUndefined();

        expect(result.data?.booksByOffset?.edges?.[0].node.id).toBe("10");
    });
    it('Query.booksByOffset_desc.page2', async () => {
        const query = /* GraphQL */ `
            query {
                booksByOffset_desc(page: 2) {
                    edges {
                        node {
                            id
                        }
                    }
                }
            }
        `;
        const response = await server.executeOperation<Query>({ query }, {
            contextValue: {
                booksPager: dataSourcePager({ dataSource, cursor }),
                booksOffsetPager: dataSourcePager({ dataSource: dataSourceOffset }),
            },
        });
        assert(response.body.kind === "single");
        const result = response.body.singleResult;

        expect(result.errors).toBeUndefined();

        expect(result.data?.booksByOffset_desc?.edges?.[0].node.id).toBe("89");
    });
    it('Query.booksByOffset.sortByTitle', async () => {
        const query = /* GraphQL */ `
            query {
                booksByOffset(sortBy: TITLE) {
                    edges {
                        node {
                            id
                            title
                        }
                    }
                }
            }
        `;
        const response = await server.executeOperation<Query>({ query }, {
            contextValue: {
                booksPager: dataSourcePager({ dataSource, cursor }),
                booksOffsetPager: dataSourcePager({ dataSource: dataSourceOffset }),
            },
        });
        assert(response.body.kind === "single");
        const result = response.body.singleResult;

        expect(result.errors).toBeUndefined();

        const edges = result.data?.booksByOffset?.edges;
        expect(edges?.[0].node.title).toBe("Title 0");
        expect(edges?.[1].node.title).toBe("Title 1");
        expect(edges?.[2].node.title).toBe("Title 10");
        expect(edges?.[3].node.title).toBe("Title 11");
    });
});
