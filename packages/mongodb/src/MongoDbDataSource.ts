import { ArgsBackward, ArgsForward, DefaultCursorEncoderDecoder } from "@graphql-pagination/core";
import { DataSourceBase } from "@graphql-pagination/core";
import { Db, ObjectId, Document, Filter } from "mongodb";


export interface MongoDbDataSourceConfig<NodeType extends Document, ArgsForwardType, ArgsBackwardType> {
    /** Mongo Db */
    mongoDb: Db;
    /** Colleciton name */
    collectionName: string;
    /** Column name acting as ID for cursor paging. Default is _id */
    idColumnName?: string;
    /** Additional filters on collection */
    filters?: (args: ArgsForwardType | ArgsBackwardType) => Filter<NodeType>[] | undefined;
}
/**
 * DataSource for MongoDB.
 * To use it over default `_id` as objectId it's needed to use cursor ObjectIdCursorEncoderDecoder.
 * 
 * Example:
 * 
 * ```ts
 * const ds = new MongoDbDataSource<BookType>({ collectionName, mongoDb });
 * const cursor = new ObjectIdCursorEncoderDecoder();
 * const booksPager = dataSourceLoaderPager({ dataSource, cursor }), 
 * ```
 */
export class MongoDbDataSource<NodeType extends Document, IdType = ObjectId,
    ArgsForwardType extends ArgsForward = ArgsForward,
    ArgsBackwardType extends ArgsBackward = ArgsBackward>
    extends DataSourceBase<NodeType, IdType, ArgsForwardType, ArgsBackwardType> {

    mongoDb: Db;
    collectionName: string;

    filters?: (args: ArgsForwardType | ArgsBackwardType) => Filter<NodeType>[] | undefined;

    constructor(config: MongoDbDataSourceConfig<NodeType, ArgsForwardType, ArgsBackwardType>) {
        super(config.idColumnName || "_id");
        this.mongoDb = config.mongoDb;
        this.collectionName = config.collectionName;
        this.filters = config.filters;
    }

    collection() {
        return this.mongoDb.collection<NodeType>(this.collectionName);
    }


    async after(afterId: IdType | undefined, size: number, args: ArgsForwardType): Promise<NodeType[]> {
        const conditions = this.filters && this.filters(args) || new Array();
        if (afterId) conditions.push({ [this.idFieldName]: { "$gt": afterId } });
        const query: Filter<NodeType> = conditions.length ? {
            "$and": conditions,
        } : {};

        const result = await this.collection().find(query)
            .sort({ [this.idFieldName]: 1 })
            .limit(size)
            .toArray();

        return result as NodeType[];
    }

    async before(beforeId: IdType | undefined, size: number, args: ArgsBackwardType): Promise<NodeType[]> {
        const conditions = this.filters && this.filters(args) || new Array();
        if (beforeId) conditions.push({ [this.idFieldName]: { "$lt": beforeId } });
        const query: Filter<NodeType> = conditions.length ? {
            "$and": conditions,
        } : {};

        const result = await this.collection().find(query)
            .sort({ [this.idFieldName]: -1 })
            .limit(size)
            .toArray();

        return result as NodeType[];
    }

    async totalCount(args: ArgsForwardType | ArgsBackwardType): Promise<number> {
        const conditions = this.filters && this.filters(args) || new Array();
        const query = conditions.length ? {
            "$and": conditions,
        } : {};
        return await this.collection().countDocuments(query);
    }

}

/**
 * Cursor encoder/decoder for Mongo ObjectId
 * @see https://www.mongodb.com/docs/manual/reference/method/ObjectId/
 */
export class ObjectIdCursorEncoderDecoder extends DefaultCursorEncoderDecoder<ObjectId | string> {
    override decode(encodedCursor: string): ObjectId {
        const decodedId = super.decode(encodedCursor) as string;  // is string
        return new ObjectId(decodedId);
    }
    override encode(cursor: ObjectId): string {
        return super.encode(cursor.toString());
    }
}
