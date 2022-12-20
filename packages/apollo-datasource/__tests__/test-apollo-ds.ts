import { ApolloDataSourcePager } from "../src";
import { ArrayDataSource } from "@graphql-pagination/core";
import { UserInputError } from "apollo-server-errors";

describe("apollo-data-source", () => {

    const january = new Date("2022-01-01");
    const data = Array.from(Array(100)).map((e, i) => ({
        id: i + 1,
        title: `Title ${i + 1}`,
        author: `Author ${(i + 1) % 10}`,
        published: new Date(january.setDate(i + 1)),
    }));

    let pagerById: ApolloDataSourcePager<any>;
    const dataSource = new ArrayDataSource(data);
    beforeAll(() => {
        pagerById = new ApolloDataSourcePager({ dataSource });
    });

    test("forward-totalCount", async () => {
        const connection = await pagerById.forwardResolver({ "first": 10 });
        expect(connection.totalCount).toBe(100);
    });

    test("backward-totalCount", async () => {
        const connection = await pagerById.backwardResolver({ "last": 10 });
        expect(connection.totalCount).toBe(100);
    });
    test("backward-out-of-range", async () => {
        const connection = await pagerById.backwardResolver({ "last": 10, "before": pagerById.cursor.encode(1) });
        expect(connection.edges).toHaveLength(0);
    });

    test("backward-last-after", async () => {
        const connection = await pagerById.backwardResolver({ "last": 10, "before": pagerById.cursor.encode(80) });
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(79);
        expect(connection.edges[9].node.id).toBe(70);

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(true);
    });

});

describe("validation", () => {

    let pager: ApolloDataSourcePager<any>;
    beforeAll(() => {
        pager = new ApolloDataSourcePager({ dataSource: new ArrayDataSource([]) });
    });

    test("after-invalid", async () => {
        return expect(() => pager.forwardResolver({ first: 10, after: "bad" }))
            .rejects.toStrictEqual(new UserInputError("Invalid cursor value"));
    });

    test("before-invalid", async () => {
        return expect(() => pager.backwardResolver({ first: 10, before: "bad" }))
            .rejects.toStrictEqual(new UserInputError("Invalid cursor value"));
    });

});
