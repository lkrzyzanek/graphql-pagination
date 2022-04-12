import {ApolloDataSourcePager} from "../src";
import {ArrayDataSource} from "@graphql-pagination/core";

describe("apollo-data-source", () => {

    const january = new Date("2022-01-01");
    const data = Array.from(Array(100)).map((e, i) => ({
        id: i + 1,
        title: `Title ${i + 1}`,
        author: `Author ${(i + 1) % 10}`,
        published: new Date(january.setDate(i + 1)),
    }));

    let pagerById: ApolloDataSourcePager<any>;
    beforeAll(() => {
        pagerById = new ApolloDataSourcePager({dataSource: new ArrayDataSource(data)});
    });

    test("forward-totalCount", () => {
        const connection = pagerById.forwardResolver({"first": 10});
        expect(connection.totalCount).toBe(100);
    });

    test("backward-totalCount", () => {
        const connection = pagerById.backwardResolver({"last": 10});
        expect(connection.totalCount).toBe(100);
    });
    test("backward-out-of-range", () => {
        const connection = pagerById.backwardResolver({"last": 10, "before": pagerById.cursor.encode(1)});
        expect(connection.edges).toHaveLength(0);
    });

    test("backward-last-after", () => {
        const connection = pagerById.backwardResolver({"last": 10, "before": pagerById.cursor.encode(80)});
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(79);
        expect(connection.edges[9].node.id).toBe(70);

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(true);
    });

    test("edgeObject", () => {
        const result = pagerById.edgeObject(data[0]);
        expect(result).not.toBeNull();
    });

});
