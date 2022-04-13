const { ApolloServer, gql } = require("apollo-server");
const { DataSourcePager } = require("@graphql-pagination/core");
const { typeDefs: scalarTypeDefs, resolvers: scalarResolvers } = require("graphql-scalars");
const { SqlKnexDataSource } = require("@graphql-pagination/sql-knex");

// generate 100 books { id : x, title: "Book x", published: "2022-01-01T14:17:11.929Z" }
const january = new Date("2022-01-01");
const createBook = (i) => {
    return {
        id: i + 1,
        title: `Book ${i + 1}`,
        author: `Author ${(i + 1) % 10}`,
        published: new Date(january.setDate(i + 1)),
    };
};
const books = Array.from(Array(100)).map((e, i) => createBook(i));

const knex = require("knex")({
    client: "better-sqlite3",
    connection: {
        filename: ":memory:",
    },
    useNullAsDefault: true,
    debug: true,
});

const tableName = "book";

async function initDb() {
    await knex.schema.createTable(tableName, (table) => {
        table.integer("id");
        table.string("title");
        table.string("author");
        table.date("published");
    });
    await knex.batchInsert("book", books, 10);
}


// BookConnection is generated by DataSourcePager
const typeDefs = gql`
    type Book {
        id: ID!
        title: String
        author: String
        published: DateTime
    }
    type Query {
        booksAsc(first: Int = 10 after: String author: String): BookConnection
        booksDesc(last: Int = 10 before: String author: String): BookConnection
    }
`;


const baseQueryFilter = (args) => {
    return knex(tableName)
        .where(builder => {
            if (args.author) builder.where("author", args.author);
        });
};

const ds = new SqlKnexDataSource({
    tableName: tableName,
    idFieldName: "id",
    knex: knex,
    baseQuery: baseQueryFilter,
});

const pager = new DataSourcePager({
    dataSource: ds,
    typeName: "Book",
});

const resolvers = {
    Query: {
        booksAsc: (_, args) => pager.forwardResolver(args),
        booksDesc: (_, args) => pager.backwardResolver(args),
    },
};


const createApolloServer = () => {
    return new ApolloServer({
        typeDefs: [
            typeDefs,
            pager.typeDefs, // BookConnection, BookEdge, PageInfo typeDefs
            scalarTypeDefs, // for DateTime
        ],
        resolvers: [
            resolvers,
            scalarResolvers, // for DateTime
        ],
    });
};

const server = createApolloServer();

initDb()
    .then(() => server.listen())
    .then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    });
