# GraphQL Pagination [![codecov](https://codecov.io/gh/lkrzyzanek/graphql-pagination/branch/main/graph/badge.svg?token=8PZ27JTJLI)](https://codecov.io/gh/lkrzyzanek/graphql-pagination)

Library to easily wrap data to [GraphQL Pagination](https://graphql.org/learn/pagination/).

Implements Relay's [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm) and supports Offset Pagination.

Designed in modular and extendable way.

## Getting Started

You can use built-in [`dataSourcePager`](packages/core/README.md#datasourcepager) which provides GraphQL Resolver for your Graph.
By implementing / using DataSource you have full control how data are provided to the Pager.

You can use one of these provided:

1. [ArrayDataSource](packages/core/README.md) - bundled in [@graphql-pagination/core](https://www.npmjs.com/package/@graphql-pagination/core) module
2. [OffsetDataSourceWrapper](packages/core/README.md) - bundled in [@graphql-pagination/core](https://www.npmjs.com/package/@graphql-pagination/core) module
3. [SQL Knex](packages/sql-knex) - bundled in [sql-knex](https://www.npmjs.com/package/@graphql-pagination/sql-knex) module

Or implement your own by implementing the [DataSource](packages/core/src/datasource/DataSource.ts) interface.

### Apollo Integration

There is no need for any special integration or dependency. Just use core pager.
In places where user's input is validated the proper `GraphQLError` is thrown with extensions object containing code `BAD_USER_INPUT`.

For more examples go to [core package](packages/core).
