import { ArrayDataSource, DataSourcePager } from "../src";

describe("pager-objects", () => {


    test("edge ds as param", () => {
        const data = [{ "id": 1 }];
        const dataSource = new ArrayDataSource(data);
        const pager = new DataSourcePager({});

        const edge = pager.edgeObject({ "id": 1 }, dataSource);
        expect(edge.cursor).not.toBeUndefined();
        expect(edge.node).not.toBeUndefined();
    });

});
