import type { ObjectId } from "mongodb";
import type { Book } from "../__generated__/resolversTypes";

export type BookType = Book & { _id: ObjectId };