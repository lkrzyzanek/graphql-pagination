const { ApolloServer, gql } = require("apollo-server");
const { ArrayDataSource, DataSourcePager } = require("@graphql-pagination/core");
const { typeDefs: scalarTypeDefs, resolvers: scalarResolvers } = require("graphql-scalars");

const typeDefs = gql`
    type Book {
        id: ID!
        title: String
        published: DateTime
    }
    type PageInfo {
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
        startCursor: String
        endCursor: String
    }
    type BookEdge {
        node: Book!
        cursor: String!
    }
    type BookConnection {
        totalCount: Int!
        edges: [BookEdge!]
        pageInfo: PageInfo!
    }
    type Query {
        booksAsc(first: Int = 10 after: String): BookConnection
        booksDesc(last: Int = 10 before: String): BookConnection
        booksPublishedAsc(first: Int = 10 after: String): BookConnection
        booksPublishedDesc(last: Int = 10 before: String): BookConnection
    }
`;

// generate 100 books { id : x, title: "Book x", published: "2022-01-01T14:17:11.929Z" }
const january = new Date("2022-01-01");
const createBook = (i) => {
    return {
        id: i + 1,
        title: `Book ${i + 1}`,
        published: new Date(january.setDate(i + 1)),
    };
};
const books = Array.from(Array(100)).map((e, i) => createBook(i));

const ds = new ArrayDataSource(books);
const pagerById = new DataSourcePager(ds);

const dsPublished = new ArrayDataSource(books, "published");
const pagerPublished = new DataSourcePager(dsPublished);

const resolvers = {
    Query: {
        booksAsc: (_, args) => pagerById.forwardResolver(args),
        booksDesc: (_, args) => pagerById.backwardResolver(args),
        booksPublishedAsc: (_, args) => pagerPublished.forwardResolver(args),
        booksPublishedDesc: (_, args) => pagerPublished.backwardResolver(args),
    },
};

const createApolloServer = () => {
    return new ApolloServer({
        typeDefs: [typeDefs, ...scalarTypeDefs],
        resolvers: [resolvers, scalarResolvers],
    });
};


const server = createApolloServer();

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
