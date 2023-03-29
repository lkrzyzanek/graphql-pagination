import type { ArgsBackward, ArgsForward } from "@graphql-pagination/core";
import { DataSourceBase } from "@graphql-pagination/core";
import type { Db, ObjectId, Document, Filter } from "mongodb";


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
 * DataSource for MongoDB
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
        const conditions = this.filters && this.filters(args);
        const query = conditions ? {
            "$and": conditions,
        } : {};
        return await this.collection().countDocuments(query);
    }

}