import { ArgsForward, ArgsBackward } from "@graphql-pagination/core";
import { Db, MongoClient, ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoDbDataSource } from "../src";

describe("mongodb-ds", () => {

    jest.setTimeout(30_000);

    type Book = {
        _id: ObjectId
        id: number
        title: string
        author: string
        published: Date
    }

    const january = new Date("2022-01-01");
    const data = Array.from(Array(100)).map((_e, i) => ({
        _id: new ObjectId(),
        id: i,
        title: `Title ${i}`,
        author: `Author ${(i) % 10}`,
        published: new Date(january.setDate(i + 1)),
    }));

    const collectionName = "books";
    let client: MongoClient;
    let mongod: MongoMemoryServer;
    let mongoDb: Db;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create({
            binary: {
                version: "6.0.3",
            },
        });
        const uri = mongod.getUri();
        client = new MongoClient(uri, { monitorCommands: true });

        mongoDb = client.db("data");

        await mongoDb.collection(collectionName).insertMany(data);
    });

    afterAll(async () => {
        if (client) await client.close();
        if (mongod) await mongod.stop();
        // await server.stop();
    });

    describe("by-id", () => {
        let ds: MongoDbDataSource<Book>;

        beforeAll(() => {
            ds = new MongoDbDataSource({ collectionName, mongoDb });
        })
        test("totalCount", async () => {
            return expect(ds.totalCount({ "first": 10 })).resolves.toBe(100);
        });

        test("after", async () => {
            const result = await ds.after(data[5]._id, 10, { first: 0 });
            expect(result).toHaveLength(10);
            expect(result[0].id).toBe(6);
            expect(result[9].id).toBe(15);
        });
        test("after-from-begin", async () => {
            const result = await ds.after(undefined, 5, { first: 0 });
            expect(result).toHaveLength(5);
            expect(result[0].id).toBe(0);
            expect(result[4].id).toBe(4);
        });
        test("before", async () => {
            const result = await ds.before(data[90]._id, 10, { last: 0 });
            expect(result).toHaveLength(10);
            expect(result[0].id).toBe(89);
            expect(result[9].id).toBe(80);
        });
        test("before-from-begin", async () => {
            const result = await ds.before(undefined, 5, { last: 0 });
            expect(result).toHaveLength(5);
            expect(result[0].id).toBe(99);
            expect(result[4].id).toBe(95);
        });
    })

    describe("by-date", () => {
        let ds: MongoDbDataSource<Book, Date>;

        beforeAll(() => {
            ds = new MongoDbDataSource({ collectionName, idColumnName: "published", mongoDb });
        })
        test("totalCount", async () => {
            return expect(ds.totalCount({ "first": 10 })).resolves.toBe(100);
        });

        test("after", async () => {
            const result = await ds.after(new Date("2022-01-02"), 2, { first: 0 });
            expect(result).toHaveLength(2);
            expect(result[0].published).toStrictEqual(new Date("2022-01-03"));
            expect(result[1].published).toStrictEqual(new Date("2022-01-04"));
        });
        test("after-from-begin", async () => {
            const result = await ds.after(undefined, 5, { first: 0 });
            expect(result).toHaveLength(5);
            expect(result[0].published).toStrictEqual(new Date("2022-01-01"));
            expect(result[3].published).toStrictEqual(new Date("2022-01-04"));
        });
    })

    describe("filter", () => {
        type ArgsForwardType = ArgsForward & { author: string };
        type ArgsBackwardType = ArgsBackward & { author: string };
        let ds: MongoDbDataSource<Book, ObjectId, ArgsForwardType, ArgsBackwardType>;

        beforeAll(() => {
            ds = new MongoDbDataSource<Book, ObjectId, ArgsForwardType, ArgsBackwardType>({
                collectionName,
                mongoDb,
                filters: (args) => {
                    if (args.author) {
                        return [{ "author": { $eq: args.author } }]
                    }
                    return undefined;
                },
            });
        });

        const desiredAuthor = "Author 4";
        test("after", async () => {
            const result = await ds.after(undefined, 200, { first: 0, "author": desiredAuthor });
            result.forEach(book => {
                expect(book.author).toBe(desiredAuthor);
            });
            expect(result).toHaveLength(10);
        });
        test("before", async () => {
            const result = await ds.before(undefined, 200, { last: 0, "author": desiredAuthor });
            result.forEach(book => {
                expect(book.author).toBe(desiredAuthor);
            });
            expect(result).toHaveLength(10);
        });
        test("count", async () => {
            const result = await ds.totalCount({ first: 0, "author": desiredAuthor });
            expect(result).toBe(10);
        });
    })
});
