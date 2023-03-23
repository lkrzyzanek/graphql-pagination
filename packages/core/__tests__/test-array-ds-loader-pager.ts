import { ArgsForward, ArrayDataSource, dataSourceLoaderPager } from "../src";

type Book = {
    id: number
}

describe("memoization-forward", () => {

    test("default", async () => {
        let id = 0;
        const pagerById = dataSourceLoaderPager<Book, number>({
            dataSource: new ArrayDataSource(async () => {
                id++;
                return [{ id }]
            }),
            fetchTotalCountInResolver: false,   // prevent calling getNodes on forwardResolver
        });
        const connection = await pagerById.forwardResolver({ "first": 10 });
        expect(connection.edges[0].node.id).toBe(1);
        // second, third call cought by dataloader's memoisation - same parameters
        const connection2 = await pagerById.forwardResolver({ "first": 10 });
        expect(connection2.edges[0].node.id).toBe(1);
        const connection3 = await pagerById.forwardResolver({ "first": 10 });
        expect(connection3.edges[0].node.id).toBe(1);

        // another parameters (new cache key for dataloader)
        const connection4 = await pagerById.forwardResolver({ "first": 3 });
        expect(connection4.edges[0].node.id).toBe(2);
    });

    test("off", async () => {
        let id = 0;
        const pagerById = dataSourceLoaderPager<Book, number>({
            dataSource: new ArrayDataSource(async () => {
                id++;
                return [{ id }]
            }),
            fetchTotalCountInResolver: false,   // prevent calling getNodes on forwardResolver
            dataloader: {
                forward: {
                    cache: false
                }
            }
        });
        const connection = await pagerById.forwardResolver({ "first": 10 });
        expect(connection.edges[0].node.id).toBe(1);
        // second, third call cought by dataloader but no memoisation
        const connection2 = await pagerById.forwardResolver({ "first": 10 });
        expect(connection2.edges[0].node.id).toBe(2);
        const connection3 = await pagerById.forwardResolver({ "first": 10 });
        expect(connection3.edges[0].node.id).toBe(3);

        // another parameters (new cache key for dataloader)
        const connection4 = await pagerById.forwardResolver({ "first": 3 });
        expect(connection4.edges[0].node.id).toBe(4);
    });

});

describe("memoization-backward", () => {

    test("default", async () => {
        let id = 0;
        const pagerById = dataSourceLoaderPager<Book, number>({
            dataSource: new ArrayDataSource(async () => {
                id++;
                return [{ id }]
            }),
            fetchTotalCountInResolver: false,   // prevent calling getNodes on forwardResolver
        });
        const connection = await pagerById.backwardResolver({ "last": 10 });
        expect(connection.edges[0].node.id).toBe(1);
        // second, third call cought by dataloader's memoisation - same parameters
        const connection2 = await pagerById.backwardResolver({ "last": 10 });
        expect(connection2.edges[0].node.id).toBe(1);
        const connection3 = await pagerById.backwardResolver({ "last": 10 });
        expect(connection3.edges[0].node.id).toBe(1);

        // another parameters (new cache key for dataloader)
        const connection4 = await pagerById.backwardResolver({ "last": 3 });
        expect(connection4.edges[0].node.id).toBe(2);
    });

    test("off", async () => {
        let id = 0;
        const pagerById = dataSourceLoaderPager<Book, number>({
            dataSource: new ArrayDataSource(async () => {
                id++;
                return [{ id }]
            }),
            fetchTotalCountInResolver: false,   // prevent calling getNodes on forwardResolver
            dataloader: {
                backward: {
                    cache: false
                }
            }
        });
        const connection = await pagerById.backwardResolver({ "last": 10 });
        expect(connection.edges[0].node.id).toBe(1);
        // second, third call cought by dataloader but no memoisation
        const connection2 = await pagerById.backwardResolver({ "last": 10 });
        expect(connection2.edges[0].node.id).toBe(2);
        const connection3 = await pagerById.backwardResolver({ "last": 10 });
        expect(connection3.edges[0].node.id).toBe(3);

        // another parameters (new cache key for dataloader)
        const connection4 = await pagerById.backwardResolver({ "last": 3 });
        expect(connection4.edges[0].node.id).toBe(4);
    });

});

describe("memoization-count", () => {

    type ArgsForwardType = ArgsForward & { filter?: string };

    test("default", async () => {
        let counter = 0;
        const pagerById = dataSourceLoaderPager<Book, number, ArgsForwardType>({
            dataSource: new ArrayDataSource(async () => {
                counter++;
                const data = Array.from(Array<Book>(counter)).map(() => ({
                    id: counter + 1,
                }));
                return data;
            }),
        });
        const count = await pagerById.totalCount({ "first": 10 });
        expect(count).toBe(1);
        // second, third call cought by dataloader's memoisation - same parameters
        const count2 = await pagerById.totalCount({ "first": 10 });
        expect(count2).toBe(1);
        const count3 = await pagerById.totalCount({ "first": 10 });
        expect(count3).toBe(1);
        // different parameter but first is ignored on counting!
        const count4 = await pagerById.totalCount({ "first": 3 });
        expect(count4).toBe(1);

        // another parameter - filter (new cache key for dataloader)
        const count5 = await pagerById.totalCount({ "first": 3, "filter": "filter-test" });
        expect(count5).toBe(2);
    });

    test("off", async () => {
        let counter = 0;
        const pagerById = dataSourceLoaderPager<Book, number, ArgsForwardType>({
            dataSource: new ArrayDataSource(async () => {
                counter++;
                const data = Array.from(Array<Book>(counter)).map(() => ({
                    id: counter + 1,
                }));
                return data;
            }),
            fetchTotalCountInResolver: false,   // prevent calling getNodes on forwardResolver
            dataloader: {
                count: {
                    cache: false
                }
            }
        });
        const count = await pagerById.totalCount({ "first": 10 });
        expect(count).toBe(1);
        // second, third call cought by dataloader but no memoisation
        const count2 = await pagerById.totalCount({ "first": 10 });
        expect(count2).toBe(2);
        const count3 = await pagerById.totalCount({ "first": 10 });
        expect(count3).toBe(3);

        // different parameter but first is ignored on counting!
        const count4 = await pagerById.totalCount({ "first": 3 });
        expect(count4).toBe(4);

        // another parameter - filter (new cache key for dataloader)
        const count5 = await pagerById.totalCount({ "first": 3, "filter": "filter-test" });
        expect(count5).toBe(5);
    });

});