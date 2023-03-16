import {ArrayDataSource, OffsetDataSourceWrapper} from "../src";

type Data = {
    id: number
}

/* Offset DS */
class ArrayOffsetDs extends ArrayDataSource<Data, number> {

    async after(start, size, args) {
        // No field data comparison involved. It's just offset slicing
        return this.getNodes(args).then(data => data.slice(start, start + size));
    }

    async before(start, size, args) {
        // No field data comparison involved. It's just offset slicing
        return this.getNodes(args).then(data => data
            .sort((a, b) => b.id - a.id)
            .slice(start, start + size)
        );
    }

}

describe("offset-totalCount", () => {

    test("all", async () => {
        const ds = new ArrayOffsetDs([{"id": 1}, {"id": 2}, {"id": 3}, {"id": 4}]);
        const offset = new OffsetDataSourceWrapper(ds);
        return expect(offset.totalCount({ first: 0 })).resolves.toStrictEqual(4);
    })

});

describe("offset-after", () => {

    test("no-offset", async () => {
        const ds = new ArrayOffsetDs([{"id": 1}]);
        const offset = new OffsetDataSourceWrapper(ds);
        return expect(offset.after(undefined, 10, { first: 0 })).resolves.toStrictEqual([{"_index": 0, "id": 1}]);
    })
    test("offset", async () => {
        const ds = new ArrayOffsetDs([{"id": 1}, {"id": 2}, {"id": 3}, {"id": 4}]);
        const offset = new OffsetDataSourceWrapper(ds);
        return expect(offset.after(2, 1, { first: 0 })).resolves.toStrictEqual([
            {"_index": 3, "id": 4}
        ]);
    })

});

describe("offset-before", () => {

    test("no-offset", async () => {
        const ds = new ArrayOffsetDs([{"id": 1}]);
        const offset = new OffsetDataSourceWrapper(ds);
        return expect(offset.before(undefined, 10, { last: 0 })).resolves.toStrictEqual([{"_index": 0, "id": 1}]);
    })
    test("offset", async () => {
        const ds = new ArrayOffsetDs([{"id": 1}, {"id": 2}, {"id": 3}, {"id": 4}]);
        const offset = new OffsetDataSourceWrapper(ds);
        return expect(offset.before(2, 1, { last: 0 })).resolves.toStrictEqual([
            {"_index": 3, "id": 1},
        ]);
    })

});

