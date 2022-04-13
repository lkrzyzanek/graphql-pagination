import {ArrayDataSource} from "../src";

describe("array-ds", () => {

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

    test("after-id-bad-type", () => {
        const ds = new ArrayDataSource([{"idboolean": true}, {"idboolean": true}, {"idboolean": true}], "idboolean");
        return expect(ds.after(1, 10, {first: 10})).rejects.toStrictEqual(new Error("Type boolean is not supported"));
    })
    test("before-id-bad-type", () => {
        const ds = new ArrayDataSource([{"idboolean": true}, {"idboolean": true}, {"idboolean": true}], "idboolean");
        return expect(ds.before(1, 10, {last: 10})).rejects.toStrictEqual(new Error("Type boolean is not supported"));
    })

})