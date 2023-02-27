import {ArrayDataSource, DataSourcePager} from "../src";
import { strict as assert } from "node:assert";
import { Kind, ObjectTypeDefinitionNode } from "graphql";

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
        const pager = new DataSourcePager({dataSource: new ArrayDataSource([]), typeName: "TEST"});

        expect(pager.typeDef.PageInfoType).not.toBeNull();
        expect(pager.typeDef.EdgeType).not.toBeNull();
        expect(pager.typeDef.ConnectionType).not.toBeNull();
        expect(pager.typeDef.PageInfoTypeObj).not.toBeNull();
        expect(pager.typeDef.EdgeTypeObj).not.toBeNull();
        expect(pager.typeDef.ConnectionTypeObj).not.toBeNull();
    });

    test("directives", () => {
        const pager = new DataSourcePager({
            dataSource: new ArrayDataSource([]),
            typeName: "TEST",
            typeDefDirectives: {
                pageInfo: "@testDirective1",
                connection: "@testDirective2",
                edge: "@testDirective3",
            },
        });

        expect(pager.typeDef.PageInfoType).toContain("PageInfo @testDirective1 {")
        expect(pager.typeDef.ConnectionType).toContain("TESTConnection @testDirective2 {")
        expect(pager.typeDef.EdgeType).toContain("TESTEdge @testDirective3 {");
        assert(pager.typeDef.PageInfoTypeObj.definitions[0].kind === Kind.OBJECT_TYPE_DEFINITION);
        expect(pager.typeDef.PageInfoTypeObj.definitions[0].directives?.[0].name.value).toContain("testDirective1")
        assert(pager.typeDef.ConnectionTypeObj?.definitions[0].kind === Kind.OBJECT_TYPE_DEFINITION);
        expect(pager.typeDef.ConnectionTypeObj?.definitions[0].directives?.[0].name.value).toContain("testDirective2")
        assert(pager.typeDef.EdgeTypeObj?.definitions[0].kind === Kind.OBJECT_TYPE_DEFINITION);
        expect(pager.typeDef.EdgeTypeObj.definitions[0].directives?.[0].name.value).toContain("testDirective3")
    });

});
