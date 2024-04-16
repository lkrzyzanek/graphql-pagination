import { OffsetDataSourceWrapper } from '@graphql-pagination/core';
import { MongoDbDataSource, MongoDbOffsetDataSource } from '@graphql-pagination/mongodb';
import { Db, ObjectId } from 'mongodb';
import { QueryBooksArgs, QueryBooksByOffsetArgs, QueryBooksByOffset_DescArgs, QueryBooks_DescArgs, SortBy } from '../__generated__/resolversTypes';
import type { BookType } from '../types/Book';

const collectionName = "books";

export async function createBooksDataSource(mongoDb: Db) {
    const ds = new MongoDbDataSource<BookType, ObjectId, QueryBooksArgs, QueryBooks_DescArgs>({
        collectionName,
        //@ts-ignore
        mongoDb,
        filters: (args) => {
            const filters = [];
            if (args.author) filters.push({ "author": { $eq: args.author } });
            return filters;
        },
    });
    return ds;
}

function sortByFieldName(args: QueryBooksByOffsetArgs | QueryBooksByOffset_DescArgs) {
    if (args.sortBy === SortBy.Id) return "id";
    if (args.sortBy === SortBy.Title) return "title";
    if (args.sortBy === SortBy.Author) return "author";
    if (args.sortBy === SortBy.Published) return "published";
    return "_id";
}

export function createBooksOffsetDataSource(mongoDb: Db): OffsetDataSourceWrapper<BookType, QueryBooksByOffsetArgs, QueryBooksByOffset_DescArgs> {
    const ds = new MongoDbOffsetDataSource<BookType, QueryBooksByOffsetArgs, QueryBooksByOffset_DescArgs>({
        collectionName,
        sortByFieldName,
        mongoDb,
        filters: (args) => {
            const filters = [];
            if (args.author) filters.push({ "author": { $eq: args.author } });
            return filters;
        },
    });
    return new OffsetDataSourceWrapper<BookType, QueryBooksByOffsetArgs, QueryBooksByOffset_DescArgs>(ds);
}

export async function insertTestData(mongoDb: Db) {
    const january = new Date("2022-01-01");
    const data = Array.from(Array(100)).map((_e, i) => ({
        _id: new ObjectId(),
        id: i,
        title: `Title ${i}`,
        author: `Author ${(i) % 10}`,
        published: new Date(january.setDate(i + 1)),
    }));
    await mongoDb.collection(collectionName).insertMany(data);
}
