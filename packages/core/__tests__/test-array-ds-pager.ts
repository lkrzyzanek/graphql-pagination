import {ArrayDataSource, DataSourcePager} from "../src";

const january = new Date("2022-01-01");
const data = Array.from(Array(100)).map((e, i) => ({
    id: i + 1,
    title: `Title ${i + 1}`,
    author: `Author ${(i + 1) % 10}`,
    published: new Date(january.setDate(i + 1)),
}));
const filter = (books, args) => {
    if (args.title) return books.filter(b => b.title === args.title);
    if (args.author) return books.filter(b => b.author === args.author);
    return books;
};
const validation = (args) => {
    if (args.title && !data.find(b => b.title === args.title)) throw Error(`Title ${args.title} not exists`);
    if (args.author && !data.find(b => b.author === args.author)) throw Error(`Author ${args.author} not exists`);
}

describe("array-ds-by-id", () => {
    let pagerById: DataSourcePager;
    beforeAll(() => {
        pagerById = new DataSourcePager({dataSource: new ArrayDataSource(data)});
    });

    test("forward-totalCount", () => {
        const connection = pagerById.forwardResolver({"first": 10});
        expect(connection.totalCount).toBe(100);
    });
    test("forward-out-of-range", () => {
        const connection = pagerById.forwardResolver({"first": 10, "after": pagerById.cursor.encode(100)});
        expect(connection.edges).toHaveLength(0);
    });

    test("forward-first-only", () => {
        const connection = pagerById.forwardResolver({"first": 10});
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(1);
        expect(connection.edges[9].node.id).toBe(10);

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(false);
    });
    test("forward-first-after", () => {
        const connection = pagerById.forwardResolver({"first": 10, "after": pagerById.cursor.encode(20)});
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(21);
        expect(connection.edges[9].node.id).toBe(30);

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(true);
    });
    test("forward-first-after-last", () => {
        const connection = pagerById.forwardResolver({"first": 10, "after": pagerById.cursor.encode(90)});
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(91);
        expect(connection.edges[9].node.id).toBe(100);

        expect(connection.pageInfo.hasNextPage).toBe(false);
        expect(connection.pageInfo.hasPreviousPage).toBe(true);
    });

    /* Backward Tests */

    test("backward-totalCount", () => {
        const connection = pagerById.backwardResolver({"last": 10});
        expect(connection.totalCount).toBe(100);
    });
    test("backward-out-of-range", () => {
        const connection = pagerById.backwardResolver({"last": 10, "before": pagerById.cursor.encode(1)});
        expect(connection.edges).toHaveLength(0);
    });

    test("backward-last-after", () => {
        const connection = pagerById.backwardResolver({"last": 10, "before": pagerById.cursor.encode(80)});
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(79);
        expect(connection.edges[9].node.id).toBe(70);

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(true);
    });
    test("backward-last-after-last", () => {
        const connection = pagerById.backwardResolver({"last": 10, "before": pagerById.cursor.encode(11)});
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(10);
        expect(connection.edges[9].node.id).toBe(1);

        expect(connection.pageInfo.hasNextPage).toBe(false);
        expect(connection.pageInfo.hasPreviousPage).toBe(true);
    });
});


describe("array-ds-by-date", () => {
    let pager: DataSourcePager;
    beforeAll(() => {
        pager = new DataSourcePager({dataSource: new ArrayDataSource(data, "published")});
    });

    test("forward-totalCount", () => {
        const connection = pager.forwardResolver({"first": 10});
        expect(connection.totalCount).toBe(100);
    });

    test("forward-first-only", () => {
        const connection = pager.forwardResolver({"first": 10});
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(1);
        expect(connection.edges[9].node.id).toBe(10);

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(false);
    });

    test("backward-last-only", () => {
        const connection = pager.backwardResolver({"last": 10});
        expect(connection.edges).toHaveLength(10);
        expect(connection.edges[0].node.id).toBe(100);
        expect(connection.edges[9].node.id).toBe(91);

        expect(connection.pageInfo.hasNextPage).toBe(true);
        expect(connection.pageInfo.hasPreviousPage).toBe(false);
    });
});

describe("array-ds-filter", () => {
    let pager: DataSourcePager;

    beforeAll(() => {
        pager = new DataSourcePager({
            dataSource: new ArrayDataSource(data, "id", filter),
            validateForwardArgs: validation
        });
    });

    test("title", () => {
        const connection = pager.forwardResolver({"first": 10, "title": "Title 5"});
        expect(connection.totalCount).toBe(1);
        expect(connection.edges[0].node.id).toBe(5);
    });
    test("author", () => {
        const desiredAuthor = "Author 5";
        const connection = pager.forwardResolver({"first": 10, "author": desiredAuthor});
        expect(connection.totalCount).toBe(10);
        connection.edges.forEach((edge) => {
            expect(edge.node.author).toBe(desiredAuthor);
        })
    });
    test("validation-author", () => {
        const desiredAuthor = "Author 5";
        const connection = pager.forwardResolver({"first": 10, "author": desiredAuthor});
        expect(connection.totalCount).toBe(10);
        connection.edges.forEach((edge) => {
            expect(edge.node.author).toBe(desiredAuthor);
        })
    });
});

describe("array-ds-validation", () => {
    let pager: DataSourcePager;

    beforeAll(() => {
        pager = new DataSourcePager({
            dataSource: new ArrayDataSource(data, "id", filter),
            validateForwardArgs: validation,
            validateBackwardArgs: validation,
        });
    });

    test("validation-disabled", () => {
        const pagerNoValidation = new DataSourcePager({dataSource: new ArrayDataSource(data, "id", filter)});
        const connection = pagerNoValidation.forwardResolver({"first": 10, "title": "BAD-TITLE"});
        expect(connection.edges).toHaveLength(0);
        const connectionBack = pagerNoValidation.backwardResolver({"last": 10, "title": "BAD-TITLE"});
        expect(connectionBack.edges).toHaveLength(0);
    });

    test("validation-title", () => {
        const tested = () => pager.forwardResolver({"first": 10, "title": "BAD-TITLE"});
        expect(tested).toThrow("Title BAD-TITLE not exists");
    });
    test("validation-array-title", () => {
        const pagerValidationArray = new DataSourcePager({
            dataSource: new ArrayDataSource(data, "id", filter),
            validateForwardArgs: [validation],
            validateBackwardArgs: [validation]
        });
        const tested = () => pagerValidationArray.forwardResolver({"first": 10, "title": "BAD-TITLE"});
        expect(tested).toThrow("Title BAD-TITLE not exists");
        const testedBack = () => pagerValidationArray.backwardResolver({"last": 10, "title": "BAD-TITLE"});
        expect(testedBack).toThrow("Title BAD-TITLE not exists");
    });
    test("validation-author", () => {
        const tested = () => pager.backwardResolver({"last": 10, "author": "BAD-AUTHOR"});
        expect(tested).toThrow("Author BAD-AUTHOR not exists");
    });
});
