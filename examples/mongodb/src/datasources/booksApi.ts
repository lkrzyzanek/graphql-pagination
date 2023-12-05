import { MongoDbDataSource } from '@graphql-pagination/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { QueryBooksArgs, QueryBooks_DescArgs } from '../__generated__/resolversTypes';
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
