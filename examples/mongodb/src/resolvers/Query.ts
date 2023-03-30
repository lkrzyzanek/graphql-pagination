import { QueryResolvers } from '../__generated__/resolversTypes';

export const Query: QueryResolvers = {
    books: async (_, args, { booksPager }) => {
        return await booksPager.forwardResolver(args);
    },
    books_desc: async (_, args, { booksPager }) => {
        return await booksPager.backwardResolver(args);
    },
};;
