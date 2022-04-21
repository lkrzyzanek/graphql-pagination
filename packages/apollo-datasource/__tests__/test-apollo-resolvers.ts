import {ApolloDataSourcePager} from "../src";
import {ArrayDataSource} from "@graphql-pagination/core";

describe("apollo-pager-resolvers", () => {

    test("totalCount", () => {
        const pager = new ApolloDataSourcePager({dataSource: new ArrayDataSource([{"id": 1}]), typeName: "TEST"});

        const resolvers = pager.resolvers;
        expect(resolvers).not.toBeNull();
        expect(resolvers.TESTConnection).not.toBeUndefined();
        expect(resolvers.TESTConnection.totalCount).not.toBeUndefined();
        return expect(resolvers.TESTConnection.totalCount({first: 10})).resolves.toBe(1);
    });

});
