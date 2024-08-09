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

## MongoDbOffsetDataSource Usage

This module can be used  to perform both cursor based and offset based pagination on `MongoDbDatasources`.

## Creating a paginated list of Books type

- In this document we will discuss in more details about how to perform a cursor based pagination on a MongoDb datasource using the `MongoDbOffsetDataSource` module.
- Steps to create a pager.
    1. Create a mongoDb.
        
        ```tsx
        import { MongoClient } from 'mongodb';
        
        const options = {} //set the required options
        const mongoClient = new MongoClient("url to the mongoDb",{...options})
        const mongoDb = mongoClient.db("dbName")
        ```
        
    2. Create a datasource using the `MongoDbOffsetDataSource` .
        
        ```tsx
        const ds = new MongoDbOffsetDataSource<BookType, QueryBooksArgs>({
        	collectionName:"book",
        	mongoDb,
        	sortByFieldName: getSortByField,
        	filters: getFilter
        })
        ```
        
        While creating the “datasource” you can also provide two functions, namely `getSortByField` and `getFilter`.
        
        ```tsx
        // This function is used to tell that on what basis the documents must be 
        // sorted and then execute the query. By default "_id" field is used.
        const getSortByField = () => "Title"
        
        // This function is used to return filters on the basis of which you 
        // want to filter out the documents. Must return an array of valid 
        // mongo db conditions.
        
        // The getFilter function here will filter out the book which are written,
        // in the year provided in args.
        const getFilter = (args:QueryBooksArgs) => {
        	const filter = [];
        	if(args.publicYear === null) return filter
        	filters.push({ publicYear : {$eq: args.publicYear} })
        	return filter
        }
        ```
        
        Using the combination of above two functions, we can easily fetch the books written in a particular year sorted alphabetically on the basis of Title. The order of sorting (ascending or descending) can be decided based on the use of `forwardResolver` or `backwardResolver` functions present on the pager objects (discussed later)
        
    3. You should always wrap the object of type `MongoDbOffsetDataSource` in a `OffsetDataSourceWrapper` so that offset can be translated to cursor.
        
        ```tsx
        const dataSource = new OffsetDataSourceWrapper(ds);
        ```
        
    4. The next step would be to create a pager Object, while creating the pager object we also get access to the pager type available to be used while defining the schema, so that it can be used while defining the schema, in this case we will have the access to the `BookConnection` type.
        
        ```tsx
        const bookPager = dataSourcePager<Book, number, QueryBooksArgs>({
        	typeName:"Book",
        	fetchTotalCountInResolver: true,
        	dataSource: datasource,
        	typeDefDirectives: directiveOptions
        })
        ```
        
        This pager object now can be used to perform both cursor based and page based pagination. 😉
        
    
    We are now done with creating out pager object, next step would be to use this pager object to get paginated results 🎉.
    
- Lets define a GraphQL query to fetch a list of Books. This Query will have an object of `BookConnection`  as return type.
    
    ```tsx
    //This query will return the list of book
    type Query{
    	books(
    		first: Int! = 10
    		page: Int
    		after: String
    		publicYear : Int
    	): BookConnection!
    }
    ```
    
- Lets write a resolver for this query.
    
    ```tsx
    // Here forward resolver can be used to get the list of books sorted in 
    // ascending order by "Title",
    
    export const Query: QueryResolvers<DataSourceContext> = {
    	books:async (_,args,{bookPager}) => await bookPager.forwardResolver(args);
    }
    
    // To get the list in descending order we can do something like.
    books: async (_,args,{bookPager}) => {
    	const backwardArgs = { ...args, last: args.first, before: args.after };
      return cvePager.backwardResolver(backwardArgs);
    }
    ```