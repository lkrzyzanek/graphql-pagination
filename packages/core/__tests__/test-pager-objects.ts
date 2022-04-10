import {ArrayDataSource, DataSourcePager} from "../src";

describe("pager-objects", () => {


    test("edge", () => {
        const data = [{"id": 1}];
        const pager = new DataSourcePager({dataSource: new ArrayDataSource(data)});

        const edge = pager.edgeObject({"id": 1});
        expect(edge.cursor).not.toBeUndefined();
        expect(edge.node).not.toBeUndefined();
    });

});
