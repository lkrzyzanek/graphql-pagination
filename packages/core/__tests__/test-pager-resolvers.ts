import {ArrayDataSource, DataSourcePager} from "../src";

describe("pager-resolvers", () => {

    test("totalCount", () => {
        const pager = new DataSourcePager({dataSource: new ArrayDataSource([{"id": 1}]), typeName: "TEST"});

        const resolvers = pager.resolvers;
        expect(resolvers).toHaveLength(1);
        expect(resolvers[0]).not.toBeNull();
        expect(resolvers[0].TESTConnection).not.toBeUndefined();
        expect(resolvers[0].TESTConnection.totalCount).not.toBeUndefined();
        return expect(resolvers[0].TESTConnection.totalCount(null, {})).resolves.toBe(1);
    });

    test("totalCount-in-resolver", async () => {
        const pager = new DataSourcePager({
            dataSource: new ArrayDataSource([{"id": 1}]),
            typeName: "TEST",
            fetchTotalCountInResolver: true
        });

        const connection = await pager.forwardResolver({first: 10});
        expect(connection.totalCount).toBe(1);
    });

    test("totalCount-not-expected", async () => {
        const pager = new DataSourcePager({
            dataSource: new ArrayDataSource([{"id": 1}]),
            typeName: "TEST",
            fetchTotalCountInResolver: false
        });

        const connection = await pager.forwardResolver({first: 10});
        expect(connection.totalCount).toBeUndefined();
    });

});
