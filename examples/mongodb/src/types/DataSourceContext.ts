import type { BaseContext } from "@apollo/server";
import type { DataSourceCursorPager } from "@graphql-pagination/core";
import type { ObjectId } from "mongodb";
import type { BookType } from "./Book";

//This interface is used with graphql-codegen to generate types for resolvers context
export interface DataSourceContext extends BaseContext {
    booksPager: DataSourceCursorPager<BookType, ObjectId>;
    booksOffsetPager: DataSourceCursorPager<BookType, number>;
}
