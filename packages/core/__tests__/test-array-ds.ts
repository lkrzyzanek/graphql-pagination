import {ArrayDataSource} from "../src";

describe("array-ds-id", () => {

    test("default", () => {
        const ds = new ArrayDataSource<{ id: number }, number>([]);
        expect(ds.getId({"id": 1})).toBe(1);
    })

    test("id-defined", () => {
        const ds = new ArrayDataSource<{ id2: number }, number>([], "id2");
        expect(ds.getId({"id2": 1})).toBe(1);
    })

    test("id-defined", () => {
        const ds = new ArrayDataSource<{ id2: number }, number>([], "id2");
        expect(ds.getId({"id2": 1})).toBe(1);
    })

    test("id-zero-number", () => {
        const ds = new ArrayDataSource<{ id2: number }, number>([], "id2");
        expect(ds.getId({"id2": 0})).toBe(0);
    })
    test("id-negative-number", () => {
        const ds = new ArrayDataSource<{ id2: number }, number>([], "id2");
        expect(ds.getId({"id2": -1})).toBe(-1);
    })

    test("id-mis-configured", () => {
        const ds = new ArrayDataSource<{ id: number }, number>([], "nid");
        expect(() => ds.getId({"id": 1})).toThrow(new Error("No value for node's field 'nid'. Pager is probably not correctly configured."));
    })

    test("after-id-bad-type", () => {
        const ds = new ArrayDataSource<{ idboolean: boolean }, boolean>([{"idboolean": true}, {"idboolean": true}, {"idboolean": true}], "idboolean");
        return expect(ds.after(undefined, 10, {first: 10})).rejects.toStrictEqual(new Error("Type boolean is not supported"));
    })
    test("before-id-bad-type", () => {
        const ds = new ArrayDataSource<{ idboolean: boolean }, boolean>([{"idboolean": true}, {"idboolean": true}, {"idboolean": true}], "idboolean");
        return expect(ds.before(undefined, 10, {last: 10})).rejects.toStrictEqual(new Error("Type boolean is not supported"));
    })
    test("after-id-number-zero", async () => {
        const ds = new ArrayDataSource<{ id: number }, number>([{ "id": 0 }, { "id": 1 }, { "id": 2 }], "id");
        const afterOne = await ds.after(1, 10, { first: 10 });
        expect(afterOne[0]).toStrictEqual({ id: 2 });

        const after = await ds.after(0, 10, { first: 10 });
        expect(after[0]).toStrictEqual({ id: 1 });

        const afterUndefined = await ds.after(undefined, 10, { first: 10 });
        expect(afterUndefined[0]).toStrictEqual({ id: 0 });
    })

})

describe("array-ds-input-nodes", () => {
    test("array", async () => {
        const ds = new ArrayDataSource<{ id: number }, number>([{"id": 1}]);
        return expect(ds.after(0, 10, {first: 10})).resolves.toStrictEqual([{"id": 1}]);
    })
    test("promise", () => {
        const getData = async (): Promise<[{ id: number }]> => [{"id": 1}];
        const ds = new ArrayDataSource<{ id: number }, number>(getData);
        return expect(ds.after(0, 10, {first: 10})).resolves.toStrictEqual([{"id": 1}]);
    })
    test("promise-args", () => {
        const getData = async (args): Promise<[{ id: number }]> => [{"id": args.first}];
        const ds = new ArrayDataSource<{ id: number }, number>(getData);
        return expect(ds.after(0, 10, {first: 10})).resolves.toStrictEqual([{"id": 10}]);
    })
});

describe("array-ds-transform", () => {
    test("no-transform", async () => {
        const ds = new ArrayDataSource<{ id: number }, number>(async () => [{"id": 1}], "id");
        return expect(ds.after(0, 10, {first: 10})).resolves.toStrictEqual([{"id": 1}]);
    })
});
