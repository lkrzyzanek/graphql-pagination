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
    const array = [{"id": 1}, {"id": 2}, {"id": 3}, {"id": 4}];

    test("no-offset", async () => {
        const ds = new ArrayOffsetDs([{"id": 1}]);
        const offset = new OffsetDataSourceWrapper(ds);
        return expect(offset.after(undefined, 10, { first: 0 })).resolves.toStrictEqual([{"_index": 0, "id": 1}]);
    })
    test("offset-arg-first", async () => {
        const ds = new ArrayOffsetDs(array);
        const offset = new OffsetDataSourceWrapper(ds);
        return expect(offset.after(2, 1, { first: 0 })).resolves.toStrictEqual([{"_index": 3, "id": 4}]);
    })
    test("offset-arg-page-1", async () => {
        const ds = new ArrayOffsetDs(array);
        const offset = new OffsetDataSourceWrapper(ds);
        return expect(offset.after(undefined, 2, { page: 1 })).resolves.toStrictEqual([{"_index": 0, "id": 1}, { "_index": 1, "id": 2 }]);
    })
    test("offset-arg-page-3", async () => {
        const ds = new ArrayOffsetDs(array);
        const offset = new OffsetDataSourceWrapper(ds);
        return expect(offset.after(undefined, 3, { page: 2 })).resolves.toStrictEqual([{ "_index": 2, "id": 3 }, {"_index": 3,"id": 4}]);
    })

});

describe("offset-before", () => {
    const array = [{"id": 1}, {"id": 2}, {"id": 3}, {"id": 4}];

    test("no-offset", async () => {
        const ds = new ArrayOffsetDs([{"id": 1}]);
        const offset = new OffsetDataSourceWrapper(ds);
        return expect(offset.before(undefined, 10, { last: 0 })).resolves.toStrictEqual([{"_index": 0, "id": 1}]);
    })
    test("offset-arg-last", async () => {
        const ds = new ArrayOffsetDs(array);
        const offset = new OffsetDataSourceWrapper(ds);
        return expect(offset.before(2, 1, { last: 0 })).resolves.toStrictEqual([{"_index": 3, "id": 1}]);
    })
    test("offset-arg-page-1", async () => {
        const ds = new ArrayOffsetDs(array);
        const offset = new OffsetDataSourceWrapper(ds);
        return expect(offset.before(undefined, 3, { page: 2 })).resolves.toStrictEqual([{ "_index": 2, "id": 2 }, {"_index": 3,"id": 1}]);
    })

});

