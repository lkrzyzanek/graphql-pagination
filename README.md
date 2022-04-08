# GraphQL Pagination

Library to easily wrap data to [GraphQL Pagination](https://graphql.org/learn/pagination/).

Implements Relay's [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm).

Designed in modular and extendable way.

## Getting Started

You can use built-in `DataSourcePager` which provides GraphQL Resolver for your Graph.
By implementing / using DataSource you have full control how data are provided to the Pager.

You can use one of these provided:

1. [ArrayDataSource](packages/core/src/datasource/ArrayDataSource.ts) - bundled in `core` module
2. MongoDB - TBD
3. SQL - TBD

Or implement your own by implementing the [DataSource](packages/core/src/datasource/DataSource.ts) interface.

### Example

```js
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
```