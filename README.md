# GraphQL Pagination [![codecov](https://codecov.io/gh/lkrzyzanek/graphql-pagination/branch/main/graph/badge.svg?token=8PZ27JTJLI)](https://codecov.io/gh/lkrzyzanek/graphql-pagination)

Library to easily wrap data to [GraphQL Pagination](https://graphql.org/learn/pagination/).

Implements Relay's [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm).

Designed in modular and extendable way.

## Getting Started

You can use built-in [`DataSourcePager`](packages/core/README.md#datasourcepager) which provides GraphQL Resolver for your Graph.
By implementing / using DataSource you have full control how data are provided to the Pager.

You can use one of these provided:

1. [ArrayDataSource](packages/core/README.md#arraydatasource) - bundled in `core` module
2. MongoDB - TBD
3. SQL - TBD

Or implement your own by implementing the [DataSource](packages/core/src/datasource/DataSource.ts) interface.

### Example

```js
const typeDefs = gql`
    type Book {
        id: ID!
        title: String
        published: DateTime
    }
    type Query {
        booksAsc(first: Int = 10 after: String): BookConnection
        booksDesc(last: Int = 10 before: String): BookConnection
        booksPublishedAsc(first: Int = 10 after: String): BookConnection
        booksPublishedDesc(last: Int = 10 before: String): BookConnection
    }
`;

const books = [];

const ds = new ArrayDataSource(books);
const pagerById = new DataSourcePager({ dataSource: ds, typeName: "Book" });

const dsPublished = new ArrayDataSource(books, "published");
const pagerPublished = new DataSourcePager({ dataSource: dsPublished, typeName: "Book" });

const resolvers = {
    Query: {
        booksAsc: (_, args) => pagerById.forwardResolver(args),
        booksDesc: (_, args) => pagerById.backwardResolver(args),
        booksPublishedAsc: (_, args) => pagerPublished.forwardResolver(args),
        booksPublishedDesc: (_, args) => pagerPublished.backwardResolver(args),
    },
};

return new ApolloServer({
    typeDefs: [
        typeDefs,
        pagerById.typeDefs, // BookConnection, BookEdge, PageInfo typeDefs
        scalarTypeDefs,     // for DateTime
    ],
    resolvers: [
        resolvers,
        scalarResolvers,     // for DateTime
    ],
});
```

For more examples go to [core package](packages/core).
