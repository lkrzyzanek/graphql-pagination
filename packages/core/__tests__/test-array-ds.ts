import {ArrayDataSource} from "../src";

describe("array-ds-id", () => {

    test("default", () => {
        const ds = new ArrayDataSource([]);
        expect(ds.getId({"id": 1})).toBe(1);
    })

    test("id-defined", () => {
        const ds = new ArrayDataSource([], "id2");
        expect(ds.getId({"id2": 1})).toBe(1);
    })

    test("id-defined", () => {
        const ds = new ArrayDataSource([], "id2");
        expect(ds.getId({"id2": 1})).toBe(1);
    })

    test("id-mis-configured", () => {
        const ds = new ArrayDataSource([], "nid");
        expect(() => ds.getId({"id": 1})).toThrow(new Error("No value for node's field 'nid'. Pager is probably not correctly configured."));
    })

    test("after-id-bad-type", () => {
        const ds = new ArrayDataSource([{"idboolean": true}, {"idboolean": true}, {"idboolean": true}], "idboolean");
        return expect(ds.after(1, 10, {first: 10})).rejects.toStrictEqual(new Error("Type boolean is not supported"));
    })
    test("before-id-bad-type", () => {
        const ds = new ArrayDataSource([{"idboolean": true}, {"idboolean": true}, {"idboolean": true}], "idboolean");
        return expect(ds.before(1, 10, {last: 10})).rejects.toStrictEqual(new Error("Type boolean is not supported"));
    })

})

describe("array-ds-input-nodes", () => {
    test("array", async () => {
        const ds = new ArrayDataSource([{"id": 1}]);
        return expect(ds.after(0, 10, {first: 10})).resolves.toStrictEqual([{"id": 1}]);
    })
    test("promise", () => {
        const getData = async (): Promise<[any]> => [{"id": 1}];
        const ds = new ArrayDataSource(getData);
        return expect(ds.after(0, 10, {first: 10})).resolves.toStrictEqual([{"id": 1}]);
    })
    test("promise-args", () => {
        const getData = async (args): Promise<[any]> => [{"id": args.first}];
        const ds = new ArrayDataSource(getData);
        return expect(ds.after(0, 10, {first: 10})).resolves.toStrictEqual([{"id": 10}]);
    })
});

describe("array-ds-transform", () => {
    test("no-transform", async () => {
        const ds = new ArrayDataSource(async () => [{"id": 1}], "id", null);
        return expect(ds.after(0, 10, {first: 10})).resolves.toStrictEqual([{"id": 1}]);
    })
});
