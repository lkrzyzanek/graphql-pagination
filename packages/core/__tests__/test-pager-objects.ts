import { ArrayDataSource, DefaultCursorEncoderDecoder, PagerObject } from "../src";

describe("pager-objects", () => {


    test("edge ds as param", () => {
        const data = [{ "id": 1 }];
        const dataSource = new ArrayDataSource(data);

        const edge = PagerObject.edgeObject(data[0], dataSource, new DefaultCursorEncoderDecoder());
        expect(edge.cursor).not.toBeUndefined();
        expect(edge.node).not.toBeUndefined();
    });

});
