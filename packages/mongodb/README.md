# GraphQL Pagination / MongoDB

Module provides MongoDB DataSource for Graphql Pagination.


## Usage

Choose which MongoDb collection field are you going to paginate on.
If it's default `_id` it's expected that is mongo's `ObjectId` type and needs conversion from string to it via provided `ObjectIdCursorEncoderDecoder`. 
Otherwise you don't need to provide cursor and let default cursor decode the cursor. 

Initialize the `MongoDbDataSource` with following config and pass it to `dataSourcePager` like any other.
Use `filters` to provide additional filtering logic if needed.


```ts
import { MongoDbDataSource, ObjectIdCursorEncoderDecoder } from "@graphql-pagination/mongodb";

const mongoDb = mongoClient.db("data");
const dataSource = new MongoDbDataSource<BookType, ObjectId, QueryBooksArgs, QueryBooks_DescArgs>({
    collectionName: "book",
    mongoDb,
    filters: (args) => {
        const filters = [];
        if (args.author) filters.push({ "author": { $eq: args.author } });
        return filters;
    },
});

const cursor = new ObjectIdCursorEncoderDecoder();
// Create pager ideally `dataSourceLoaderPager` within context creation to get benefit of memoization.
// For long lived pager use `dataSourcePager`.
const booksPager = dataSourceLoaderPager({ 
    dataSource, 
    cursor, 
    fetchTotalCountInResolver: false 
    typeName: "Book",
}),
```

### Offset Pagination

If you want to use MongoDb's skip (offset) pagination, you can use `MongoDbOffsetDataSource` instead of `MongoDbDataSource`.
Implementation also provides sortBy feature.

For offset translation to cursor, it's needed to use `OffsetDataSourceWrapper` to wrap `MongoDbOffsetDataSource`.

```ts
import { MongoDbOffsetDataSource } from "@graphql-pagination/mongodb";

const mongoDb = mongoClient.db("data");
const ds = new MongoDbOffsetDataSource<BookType, QueryBooksArgs, QueryBooks_DescArgs>({
    collectionName: "book",
    mongoDb,
    filters: (args) => {
        const filters = [];
        if (args.author) filters.push({ "author": { $eq: args.author } });
        return filters;
    },
});
// Always wrap DS with OffsetDataSourceWrapper
const dataSource = new OffsetDataSourceWrapper(ds);

// Create pager ideally `dataSourceLoaderPager` within context creation to get benefit of memoization.
// For long lived pager use `dataSourcePager`.
const booksOffsetPager = dataSourceLoaderPager({ 
    dataSource, 
    fetchTotalCountInResolver: false 
    typeName: "Book",
}),
```

See fully working example in [examples/mongodb](../../examples/mongodb).
