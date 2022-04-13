import {SqlKnexDataSource} from "../src/SqlKnexDataSource";

describe("sql-knex-ds", () => {

    const january = new Date("2022-01-01");
    const data = Array.from(Array(100)).map((e, i) => ({
        id: i + 1,
        title: `Title ${i + 1}`,
        author: `Author ${(i + 1) % 10}`,
        published: new Date(january.setDate(i + 1)),
    }));

    let knex;

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
        let ds: SqlKnexDataSource;

        beforeAll(() => {
            ds = new SqlKnexDataSource({tableName: "test", idColumnName: "id", knex: knex});
        })
        test("totalCount", async () => {
            return expect(ds.totalCount({"first": 10})).resolves.toBe(100);
        });

        test("after", async () => {
            const result = await ds.after(5, 10, null);
            expect(result).toHaveLength(10);
            expect(result[0].id).toBe(6);
            expect(result[9].id).toBe(15);
        });
        test("after-from-begin", async () => {
            const result = await ds.after(null, 5, null);
            expect(result).toHaveLength(5);
            expect(result[0].id).toBe(1);
            expect(result[4].id).toBe(5);
        });
        test("before", async () => {
            const result = await ds.before(90, 10, null);
            expect(result).toHaveLength(10);
            expect(result[0].id).toBe(89);
            expect(result[9].id).toBe(80);
        });
        test("before-from-begin", async () => {
            const result = await ds.before(null, 5, null);
            expect(result).toHaveLength(5);
            expect(result[0].id).toBe(100);
            expect(result[4].id).toBe(96);
        });
    })

    describe("by-date", () => {
        let ds: SqlKnexDataSource;

        beforeAll(() => {
            ds = new SqlKnexDataSource({tableName: "test", idColumnName: "published", knex: knex});
        })
        test("totalCount", async () => {
            return expect(ds.totalCount({"first": 10})).resolves.toBe(100);
        });

        test("after", async () => {
            const result = await ds.after(new Date("2022-01-02"), 2, null);
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(3);
            expect(result[1].id).toBe(4);
        });
        test("after-from-begin", async () => {
            const result = await ds.after(null, 5, null);
            expect(result).toHaveLength(5);
            expect(result[0].id).toBe(1);
            expect(result[4].id).toBe(5);
        });
    })

    describe("filter", () => {
        let ds: SqlKnexDataSource;
        const tableName = "test";
        const baseQuery = (args) => {
            return knex(tableName)
                .where(builder => {
                    if (args.author) builder.where("author", args.author);
                });
        };

        beforeAll(() => {
            ds = new SqlKnexDataSource({
                    tableName: tableName,
                    baseQuery: baseQuery,
                    knex: knex
                }
            );
        })

        test("author", async () => {
            const desiredAuthor = "Author 4"
            // @ts-ignore
            const result = await ds.after(0, 2, {first: 0, "author": desiredAuthor});
            result.forEach(book => {
                expect(book.author).toBe(desiredAuthor);
            });
            return expect(result).toHaveLength(2);
        });
    })

});
