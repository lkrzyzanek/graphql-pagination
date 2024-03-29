import { ArgsBackward, ArgsForward, ArrayDataSource, dataSourcePager } from "../src";

const january = new Date("2022-01-01");
type Book = {
    id: number
    title: string
    author: string
    published: Date
}
const data: Array<Book> = Array.from(Array<Book>(100)).map((_e, i) => ({
    id: i + 1,
    title: `Title ${i + 1}`,
    author: `Author ${(i + 1) % 10}`,
    published: new Date(january.setDate(i + 1)),
}));
type FilterType = {
    title?: string
    author?: string
}
const filter = (books: Array<Book>, args: FilterType & (ArgsForward | ArgsBackward)) => {
    if (args.title) return books.filter(b => b.title === args.title);
    if (args.author) return books.filter(b => b.author === args.author);
    return books;
};
const validation = (args: FilterType & (ArgsForward | ArgsBackward)) => {
    if (args.title && !data.find(b => b.title === args.title)) throw Error(`Title ${args.title} not exists`);
    if (args.author && !data.find(b => b.author === args.author)) throw Error(`Author ${args.author} not exists`);
}

describe("array-ds-by-id", () => {
    const pagerById = dataSourcePager<Book, number>({ dataSource: new ArrayDataSource(data) });

    test("forward-totalCount", async () => {
        const connection = await pagerById.forwardResolver({ "first": 10 });
        expect(connection.totalCount).toBe(100);
    });
    test("forward-out-of-range", async () => {
        const connection = await pagerById.forwardResolver({ "first": 10, "after": pagerById.cursor.encode(100) });
        expect(connection.edges).toHaveLength(0);
    });

    test("forward-first-only", async () => {
        const connection = await pagerById.forwardResolver({ "first": 10 });
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(1);
        expect(connection.edges[9].node.id).toBe(10);

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(false);
    });
    test("forward-first-after", async () => {
        const connection = await pagerById.forwardResolver({ "first": 10, "after": pagerById.cursor.encode(20) });
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(21);
        expect(connection.edges[9].node.id).toBe(30);

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(true);
    });
    test("forward-first-after-last", async () => {
        const connection = await pagerById.forwardResolver({ "first": 10, "after": pagerById.cursor.encode(90) });
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(91);
        expect(connection.edges[9].node.id).toBe(100);

        expect(connection.pageInfo.hasNextPage).toBe(false);
        expect(connection.pageInfo.hasPreviousPage).toBe(true);
    });

    /* Backward Tests */

    test("backward-totalCount", async () => {
        const connection = await pagerById.backwardResolver({ "last": 10 });
        expect(connection.totalCount).toBe(100);
    });
    test("backward-out-of-range", async () => {
        const connection = await pagerById.backwardResolver({ "last": 10, "before": pagerById.cursor.encode(1) });
        expect(connection.edges).toHaveLength(0);
    });

    test("backward-last-after", async () => {
        const connection = await pagerById.backwardResolver({ "last": 10, "before": pagerById.cursor.encode(80) });
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(79);
        expect(connection.edges[9].node.id).toBe(70);

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(true);
    });
    test("backward-last-after-last", async () => {
        const connection = await pagerById.backwardResolver({ "last": 10, "before": pagerById.cursor.encode(11) });
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(10);
        expect(connection.edges[9].node.id).toBe(1);

        expect(connection.pageInfo.hasNextPage).toBe(false);
        expect(connection.pageInfo.hasPreviousPage).toBe(true);
    });
});


describe("array-ds-by-date", () => {
    const pager = dataSourcePager<Book, number>({ dataSource: new ArrayDataSource(data, "published") });

    test("forward-totalCount", async () => {
        const connection = await pager.forwardResolver({ "first": 10 });
        expect(connection.totalCount).toBe(100);
    });

    test("forward-first-only", async () => {
        const connection = await pager.forwardResolver({ "first": 10 });
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(1);
        expect(connection.edges[9].node.id).toBe(10);

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(false);
    });

    test("backward-last-only", async () => {
        const connection = await pager.backwardResolver({ "last": 10 });
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(100);
        expect(connection.edges[9].node.id).toBe(91);

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(false);
    });
});

describe("array-ds-by-title", () => {
    const pager = dataSourcePager<Book, string>({ dataSource: new ArrayDataSource(data, "title") });


    test("forward-totalCount", async () => {
        const connection = await pager.forwardResolver({ "first": 10 });
        expect(connection.totalCount).toBe(100);
    });

    test("forward-first-only", async () => {
        const connection = await pager.forwardResolver({ "first": 10 });
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(1);
        expect(connection.edges[9].node.id).toBe(17);   // it's sorted by title. title1, title 11 ...

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(false);
    });

    test("backward-last-only", async () => {
        const connection = await pager.backwardResolver({ "last": 10 });
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(99);
        expect(connection.edges[9].node.id).toBe(90);

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(false);
    });

    test("forward-first-after", async () => {
        const connection = await pager.forwardResolver({ "first": 10, "after": pager.cursor.encode("Title 30") });
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.title).toBe("Title 31");
        expect(connection.edges[9].node.title).toBe("Title 4");

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(true);
    });

    test("backward-last-after", async () => {
        const connection = await pager.backwardResolver({ "last": 10, "before": pager.cursor.encode("Title 80") });
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.title).toBe("Title 8");
        expect(connection.edges[9].node.title).toBe("Title 71");

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(true);
    });

});

describe("array-ds-filter", () => {
    const pager = dataSourcePager<Book, number, ArgsForward & FilterType>({
        dataSource: new ArrayDataSource(data, "id", filter),
        validateForwardArgs: validation
    });

    test("title", async () => {
        const connection = await pager.forwardResolver({ "first": 10, "title": "Title 5" });
        expect(connection.totalCount).toBe(1);
        expect(connection.edges[0].node.id).toBe(5);
    });
    test("title-data-asyncfn", async () => {
        const pager = dataSourcePager<Book, number, ArgsForward & FilterType>({
            dataSource: new ArrayDataSource(async () => data, "id", filter),
            validateForwardArgs: validation
        });
        const connection = await pager.forwardResolver({ "first": 10, "title": "Title 5" });
        expect(connection.totalCount).toBe(1);
        expect(connection.edges[0].node.id).toBe(5);
    });
    test("author", async () => {
        const desiredAuthor = "Author 5";
        const connection = await pager.forwardResolver({ "first": 10, "author": desiredAuthor });
        expect(connection.totalCount).toBe(10);
        connection.edges.forEach((edge) => {
            expect(edge.node.author).toBe(desiredAuthor);
        })
    });
    test("totalCount-resolver", async () => {
        const desiredAuthor = "Author 5";
        const pagerNoTotalCount = dataSourcePager({
            dataSource: new ArrayDataSource(data, "id", filter),
            typeName: "TEST",
            validateForwardArgs: validation,
            fetchTotalCountInResolver: false
        });
        const args = { "first": 10, "author": desiredAuthor };
        const connection = await pagerNoTotalCount.forwardResolver(args);
        expect(connection.totalCount).toBeUndefined();
        const resolvers = pagerNoTotalCount.resolvers();
        const totalCount = await resolvers.TESTConnection.totalCount({ args });
        expect(totalCount).toBe(10);

    });
    test("validation-author", async () => {
        const desiredAuthor = "Author 5";
        const connection = await pager.forwardResolver({ "first": 10, "author": desiredAuthor });
        expect(connection.totalCount).toBe(10);
        connection.edges.forEach((edge) => {
            expect(edge.node.author).toBe(desiredAuthor);
        })
    });
});

describe("array-ds-validation", () => {
    const pager = dataSourcePager<Book, number, ArgsForward & FilterType, ArgsBackward & FilterType>({
        dataSource: new ArrayDataSource(data, "id", filter),
        validateForwardArgs: validation,
        validateBackwardArgs: validation,
    });

    test("validation-disabled", async () => {
        const pagerNoValidation = dataSourcePager<Book, number, ArgsForward & FilterType, ArgsBackward & FilterType>({ dataSource: new ArrayDataSource(data, "id", filter) });
        const connection = await pagerNoValidation.forwardResolver({ "first": 10, "title": "BAD-TITLE" });
        expect(connection.edges).toHaveLength(0);
        const connectionBack = await pagerNoValidation.backwardResolver({ "last": 10, "title": "BAD-TITLE" });
        expect(connectionBack.edges).toHaveLength(0);
    });

    test("validation-title", () => {
        const tested = () => pager.forwardResolver({ "first": 10, "title": "BAD-TITLE" });
        return expect(tested).rejects.toStrictEqual(new Error("Title BAD-TITLE not exists"));
    });
    test("validation-array-title", () => {
        const pagerValidationArray = dataSourcePager<Book, number, ArgsForward & FilterType, ArgsBackward & FilterType>({
            dataSource: new ArrayDataSource(data, "id", filter),
            validateForwardArgs: [validation],
            validateBackwardArgs: [validation]
        });
        const tested = () => pagerValidationArray.forwardResolver({ "first": 10, "title": "BAD-TITLE" });
        return expect(tested).rejects.toStrictEqual(new Error("Title BAD-TITLE not exists"));
    });
    test("validation-array-title-back", () => {
        const pagerValidationArray = dataSourcePager<Book, number, ArgsForward & FilterType, ArgsBackward & FilterType>({
            dataSource: new ArrayDataSource(data, "id", filter),
            validateForwardArgs: [validation],
            validateBackwardArgs: [validation]
        });
        const testedBack = () => pagerValidationArray.backwardResolver({ "last": 10, "title": "BAD-TITLE" });
        return expect(testedBack).rejects.toStrictEqual(new Error("Title BAD-TITLE not exists"));
    });
    test("validation-author", () => {
        const tested = () => pager.backwardResolver({ "last": 10, "author": "BAD-AUTHOR" });
        return expect(tested).rejects.toStrictEqual(new Error("Author BAD-AUTHOR not exists"));
    });
});

describe("array-ds-dynanic", () => {
    const pagerNoDs = dataSourcePager<Book, number>({});
    const dataSource = new ArrayDataSource<Book, number>(data)

    test("forward-totalCount", async () => {
        const connection = await pagerNoDs.forwardResolver({ "first": 10 }, dataSource);
        expect(connection.totalCount).toBe(100);
    });

    /* Backward Tests */

    test("backward-totalCount", async () => {
        const connection = await pagerNoDs.backwardResolver({ "last": 10 }, dataSource);
        expect(connection.totalCount).toBe(100);
    });

    test("no-ds", () => {
        const tested = () => pagerNoDs.backwardResolver({ "last": 10 });
        return expect(tested).rejects.toStrictEqual(new Error("No DataSource defined"));
    });
});
