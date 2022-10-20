import {ArrayDataSource, DataSourcePager} from "../src";

describe("pager-typedefs", () => {

    test("pageInfo only", () => {
        const pager = new DataSourcePager({dataSource: new ArrayDataSource([])});

        const typeDefs = pager.typeDefs;
        expect(typeDefs).toHaveLength(1);
        expect(typeDefs[0]).not.toBeNull();
    });

    test("all", () => {
        const pager = new DataSourcePager({dataSource: new ArrayDataSource([]), typeName: "TEST"});

        const typeDefs = pager.typeDefs;
        expect(typeDefs).toHaveLength(3);
        expect(typeDefs[0]).not.toBeNull();
        expect(typeDefs[1]).toContain(/* GraphQL */`
        """
        TEST pagination edge object
        """
        type TESTEdge {
            node: TEST!
            """Cursor of the node"""
            cursor: String!
        }`);
        expect(typeDefs[2]).toContain(/* GraphQL */`
        """
        TEST pagination connection object
        """
        type TESTConnection {
            totalCount: Int!
            edges: [TESTEdge!]
            pageInfo: PageInfo!
        }`);
    });

    test("typeDef", () => {
        const pager = new DataSourcePager({dataSource: new ArrayDataSource([]), typeName: "TEST"});

        expect(pager.typeDef.PageInfoType).not.toBeNull();
        expect(pager.typeDef.EdgeType).not.toBeNull();
        expect(pager.typeDef.ConnectionType).not.toBeNull();
    });

});
