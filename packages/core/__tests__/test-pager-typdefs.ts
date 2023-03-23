import {ArrayDataSource, dataSourcePager} from "../src";
import { strict as assert } from "node:assert";
import { Kind } from "graphql";

describe("pager-typedefs", () => {

    test("pageInfo only", () => {
        const pager = dataSourcePager({dataSource: new ArrayDataSource([])});

        const typeDefs = pager.typeDefs();
        expect(typeDefs).toHaveLength(1);
        expect(typeDefs[0]).not.toBeNull();
    });

    test("all", () => {
        const pager = dataSourcePager({dataSource: new ArrayDataSource([]), typeName: "TEST"});

        const typeDefs = pager.typeDefs();
        expect(typeDefs).toHaveLength(3);
        expect(typeDefs[0]).not.toBeNull();
        expect(typeDefs[1]).toContain(`
        """
        TEST pagination edge object
        """
        type TESTEdge  {
            node: TEST!
            """Cursor of the node"""
            cursor: String!
        }`);
        expect(typeDefs[2]).toContain(`
        """
        TEST pagination connection object
        """
        type TESTConnection  {
            totalCount: Int!
            edges: [TESTEdge!]
            pageInfo: PageInfo!
        }`);
    });

    test("typeDef", () => {
        const pager = dataSourcePager({dataSource: new ArrayDataSource([]), typeName: "TEST"});

        const typeDef = pager.typeDef();
        expect(typeDef.PageInfoType).not.toBeNull();
        expect(typeDef.EdgeType).not.toBeNull();
        expect(typeDef.ConnectionType).not.toBeNull();
        expect(typeDef.PageInfoTypeObj).not.toBeNull();
        expect(typeDef.EdgeTypeObj).not.toBeNull();
        expect(typeDef.ConnectionTypeObj).not.toBeNull();
    });

    test("directives", () => {
        const pager = dataSourcePager({
            dataSource: new ArrayDataSource([]),
            typeName: "TEST",
            typeDefDirectives: {
                pageInfo: "@testDirective1",
                connection: "@testDirective2",
                edge: "@testDirective3",
            },
        });

        const typeDef = pager.typeDef();
        expect(typeDef.PageInfoType).toContain("PageInfo @testDirective1 {")
        expect(typeDef.ConnectionType).toContain("TESTConnection @testDirective2 {")
        expect(typeDef.EdgeType).toContain("TESTEdge @testDirective3 {");
        assert(typeDef.PageInfoTypeObj.definitions[0].kind === Kind.OBJECT_TYPE_DEFINITION);
        expect(typeDef.PageInfoTypeObj.definitions[0].directives?.[0].name.value).toContain("testDirective1")
        assert(typeDef.ConnectionTypeObj?.definitions[0].kind === Kind.OBJECT_TYPE_DEFINITION);
        expect(typeDef.ConnectionTypeObj?.definitions[0].directives?.[0].name.value).toContain("testDirective2")
        assert(typeDef.EdgeTypeObj?.definitions[0].kind === Kind.OBJECT_TYPE_DEFINITION);
        expect(typeDef.EdgeTypeObj.definitions[0].directives?.[0].name.value).toContain("testDirective3")
    });

});
