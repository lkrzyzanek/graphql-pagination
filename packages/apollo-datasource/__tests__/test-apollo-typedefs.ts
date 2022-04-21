import {ApolloDataSourcePager} from "../src";
import {ArrayDataSource} from "@graphql-pagination/core";

describe("apollo-pager-typedefs", () => {

    test("all", () => {
        const pager = new ApolloDataSourcePager({dataSource: new ArrayDataSource([]), typeName: "TEST"});

        const typeDefs = pager.typeDefs;
        expect(typeDefs).toHaveLength(3);
        expect(typeDefs[0]).not.toBeNull();
        expect(typeDefs[1]).toContain(/* GraphQL */`type TESTEdge {
            node: TEST!
            cursor: String!
        }`)
        expect(typeDefs[2]).toContain(/* GraphQL */`type TESTConnection {
            totalCount: Int!
            edges: [TESTEdge!]
            pageInfo: PageInfo!
        }`)
    });
});
