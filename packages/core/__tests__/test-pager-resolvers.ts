import {ArrayDataSource, dataSourcePager} from "../src";

describe("pager-resolvers", () => {

    test("totalCount", () => {
        const pager = dataSourcePager<{ id: number }, number>({dataSource: new ArrayDataSource<{ id: number }, number>([{"id": 1}]), typeName: "TEST"});

        const resolvers = pager.resolvers();
        expect(resolvers).not.toBeNull();
        expect(resolvers.TESTConnection).not.toBeUndefined();
        expect(resolvers.TESTConnection.totalCount).not.toBeUndefined();
        return expect(resolvers.TESTConnection.totalCount({first: 10})).resolves.toBe(1);
    });

    test("totalCount-in-resolver", async () => {
        const pager = dataSourcePager<{ id: number }, number>({
            dataSource: new ArrayDataSource([{"id": 1}]),
            typeName: "TEST",
            fetchTotalCountInResolver: true
        });

        const connection = await pager.forwardResolver({first: 10});
        expect(connection.totalCount).toBe(1);
    });

    test("totalCount-not-expected", async () => {
        const pager = dataSourcePager<{ id: number }, number>({
            dataSource: new ArrayDataSource([{"id": 1}]),
            typeName: "TEST",
            fetchTotalCountInResolver: false
        });

        const connection = await pager.forwardResolver({first: 10});
        expect(connection.totalCount).toBeUndefined();
    });

});
