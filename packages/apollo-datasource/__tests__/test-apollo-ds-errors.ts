import {ApolloDataSourcePager} from "../src";
import {ArrayDataSource} from "@graphql-pagination/core";

describe("errors", () => {

    const ds = new ArrayDataSource([], "id", () => {
        throw new Error("DS Error");
    });
    const failingPager = new ApolloDataSourcePager({dataSource: ds});

    test("ds-forward-error", async () => {
        return expect(() => failingPager.forwardResolver({first: 10}))
            .rejects.toStrictEqual(new Error("DS Error"));
    });

    test("ds-backward-error", async () => {
        return expect(() => failingPager.backwardResolver({last: 10}))
            .rejects.toStrictEqual(new Error("DS Error"));
    });

});
