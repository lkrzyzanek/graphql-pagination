import {ApolloDataSourcePager} from "../src";
import {ArrayDataSource} from "@graphql-pagination/core";

describe("apollo-pager-resolvers", () => {

    test("totalCount", () => {
        const pager = new ApolloDataSourcePager({dataSource: new ArrayDataSource([{"id": 1}]), typeName: "TEST"});

        const resolvers = pager.resolvers;
        expect(resolvers).toHaveLength(1);
        expect(resolvers[0]).not.toBeNull();
        expect(resolvers[0].TESTConnection).not.toBeUndefined();
        expect(resolvers[0].TESTConnection.totalCount).not.toBeUndefined();
        return expect(resolvers[0].TESTConnection.totalCount(null, {})).resolves.toBe(1);
    });

});
