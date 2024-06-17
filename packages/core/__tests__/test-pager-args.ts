import { GraphQLError } from "graphql";
import {ArrayDataSource, dataSourcePager} from "../src";

describe("pager-args", () => {


    test("first-non-negative", async () => {
        const pager = dataSourcePager<{ id: number }, number>({dataSource: new ArrayDataSource<{ id: number }, number>([{"id": 1}]), typeName: "TEST"});

        try {
            await pager.forwardResolver({first: -1});
            throw new Error("no error thrown");
        } catch (e) {
            expect(e.message).toBe("first argument has to be a non-negative number");
            const ex = e as GraphQLError;
            expect(ex.extensions).toStrictEqual({ code: "BAD_USER_INPUT" });
        }
    });

    test("last-non-negative", async () => {
        const pager = dataSourcePager<{ id: number }, number>({dataSource: new ArrayDataSource<{ id: number }, number>([{"id": 1}]), typeName: "TEST"});

        try {
            await pager.backwardResolver({last: -1});
            throw new Error("no error thrown");
        } catch (e) {
            expect(e.message).toBe("last argument has to be a non-negative number");
            const ex = e as GraphQLError;
            expect(ex.extensions).toStrictEqual({ code: "BAD_USER_INPUT" });
        }
    });

    test("page-positive-forward", async () => {
        const pager = dataSourcePager<{ id: number }, number>({dataSource: new ArrayDataSource<{ id: number }, number>([{"id": 1}]), typeName: "TEST"});

        try {
            await pager.forwardResolver({first: 10, page: 0});
            throw new Error("no error thrown");
        } catch (e) {
            expect(e.message).toBe("page argument has to be a positive number");
            const ex = e as GraphQLError;
            expect(ex.extensions).toStrictEqual({ code: "BAD_USER_INPUT" });
        }
    });

    test("page-positive-backward", async () => {
        const pager = dataSourcePager<{ id: number }, number>({dataSource: new ArrayDataSource<{ id: number }, number>([{"id": 1}]), typeName: "TEST"});

        try {
            await pager.backwardResolver({last: 10, page: 0});
            throw new Error("no error thrown");
        } catch (e) {
            expect(e.message).toBe("page argument has to be a positive number");
            const ex = e as GraphQLError;
            expect(ex.extensions).toStrictEqual({ code: "BAD_USER_INPUT" });
        }
    });


});
