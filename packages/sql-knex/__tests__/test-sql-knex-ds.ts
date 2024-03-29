import { ArgsForward } from "@graphql-pagination/core";
import { ArgsBackward } from "@graphql-pagination/core/src";
import { SqlKnexDataSource } from "../src/SqlKnexDataSource";
import { Knex } from 'knex';

describe("sql-knex-ds", () => {

    type Book = {
        id: number
        title: string
        author: string
        published: Date
    }

    const january = new Date("2022-01-01");
    const data = Array.from(Array(100)).map((_e, i) => ({
        id: i + 1,
        title: `Title ${i + 1}`,
        author: `Author ${(i + 1) % 10}`,
        published: new Date(january.setDate(i + 1)),
    }));

    let knex: Knex<Book, Book[]>;

    jest.setTimeout(1000);

    beforeAll(async () => {
        knex = require('knex')({
            client: 'better-sqlite3',
            connection: {
                filename: ":memory:"
            },
            useNullAsDefault: true
            // debug: true,
        });
        await knex.schema.createTable('test', (table) => {
            table.integer('id');
            table.string('title')
            table.string('author')
            table.date('published')
        });
        await knex.batchInsert("test", data, 10);
    });

    afterAll(() => {
        if (knex) knex.destroy();
    })

    describe("by-id", () => {
        let ds: SqlKnexDataSource<Book, number>;

        beforeAll(() => {
            ds = new SqlKnexDataSource({ tableName: "test", idColumnName: "id", knex: knex });
        })
        test("totalCount", async () => {
            return expect(ds.totalCount({ "first": 10 })).resolves.toBe(100);
        });

        test("after", async () => {
            const result = await ds.after(5, 10, { first: 0 });
            expect(result).toHaveLength(10);
            expect(result[0].id).toBe(6);
            expect(result[9].id).toBe(15);
        });
        test("after-from-begin", async () => {
            const result = await ds.after(undefined, 5, { first: 0 });
            expect(result).toHaveLength(5);
            expect(result[0].id).toBe(1);
            expect(result[4].id).toBe(5);
        });
        test("before", async () => {
            const result = await ds.before(90, 10, { last: 0 });
            expect(result).toHaveLength(10);
            expect(result[0].id).toBe(89);
            expect(result[9].id).toBe(80);
        });
        test("before-from-begin", async () => {
            const result = await ds.before(undefined, 5, { last: 0 });
            expect(result).toHaveLength(5);
            expect(result[0].id).toBe(100);
            expect(result[4].id).toBe(96);
        });
    })

    describe("by-date", () => {
        let ds: SqlKnexDataSource<Book, Date>;

        beforeAll(() => {
            ds = new SqlKnexDataSource({ tableName: "test", idColumnName: "published", knex: knex });
        })
        test("totalCount", async () => {
            return expect(ds.totalCount({ "first": 10 })).resolves.toBe(100);
        });

        test("after", async () => {
            const result = await ds.after(new Date("2022-01-02"), 2, { first: 0 });
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(3);
            expect(result[1].id).toBe(4);
        });
        test("after-from-begin", async () => {
            const result = await ds.after(undefined, 5, { first: 0 });
            expect(result).toHaveLength(5);
            expect(result[0].id).toBe(1);
            expect(result[4].id).toBe(5);
        });
    })

    describe("filter", () => {
        type ArgsForwardType = ArgsForward & { author: string };
        type ArgsBackwardType = ArgsBackward & { author: string };
        let ds: SqlKnexDataSource<Book, number, ArgsForwardType, ArgsBackwardType>;
        const tableName = "test";
        const baseQuery = (args: ArgsForwardType | ArgsBackwardType) => {
            return knex(tableName)
                .where(builder => {
                    if (args.author) builder.where("author", args.author);
                });
        };

        beforeAll(() => {
            ds = new SqlKnexDataSource<Book, number, ArgsForwardType, ArgsBackwardType>({
                tableName: tableName,
                baseQuery: baseQuery,
                knex: knex
            }
            );
        })

        test("author", async () => {
            const desiredAuthor = "Author 4"
            const result = await ds.after(0, 2, { first: 0, "author": desiredAuthor });
            result.forEach(book => {
                expect(book.author).toBe(desiredAuthor);
            });
            return expect(result).toHaveLength(2);
        });
    })

});
