import { QueryResolvers } from '../__generated__/resolversTypes';

export const Query: QueryResolvers = {
    books: async (_, args, { booksPager }) => {
        return await booksPager.forwardResolver(args);
    },
    books_desc: async (_, args, { booksPager }) => {
        return await booksPager.backwardResolver(args);
    },
    booksByOffset: async (_, args, { booksOffsetPager }) => await booksOffsetPager.forwardResolver(args),
    booksByOffset_desc: async (_, args, { booksOffsetPager }) => await booksOffsetPager.backwardResolver(args),
};;
