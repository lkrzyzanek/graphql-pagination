import { ArgsBackward, ArgsForward, ArrayDataSource, DataSourceBase, DefaultCursorEncoderDecoder, PagerObject } from "../src";

class MockDataSource extends DataSourceBase<{ id: string }, { id: string }, ArgsForward, ArgsBackward > {
    constructor() {
        super()
    }
    async after() {
        return [];
    }
    async before() {
        return [];
    }
    async totalCount() {
        return 0;
    }

    getId = jest.fn();
}


describe("pager-objects", () => {


    test("edge ds as param", () => {
        const data = [{ "id": 1 }];
        const dataSource = new ArrayDataSource<{ id: number }, number>(data);

        const edge = PagerObject.edgeObject(data[0], dataSource, new DefaultCursorEncoderDecoder());
        expect(edge.cursor).not.toBeUndefined();
        expect(edge.node).not.toBeUndefined();
    });
    
    test("getId is called with args", () => {
        const dataSource = new MockDataSource();
        const data = [{ "id": "1" }];
        const args = { some: 'args'}
        PagerObject.connectionObject(data, args, 111, false,false, dataSource, new DefaultCursorEncoderDecoder());
        expect(dataSource.getId).toHaveBeenCalledWith(data[0], args);
    })

});
