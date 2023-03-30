import { Connection } from '@graphql-pagination/core';
import { BookConnectionResolvers } from '../__generated__/resolversTypes';

export const BookConnection: BookConnectionResolvers = {
    totalCount: async (connection: Connection, __, { booksPager }) => {
        return await booksPager.totalCount(connection.args);
    }
};
