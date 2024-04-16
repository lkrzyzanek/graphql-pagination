import { ArgsBackward, ArgsForward, DataSourceBase } from '@graphql-pagination/core';
import { Db, Document, Filter } from 'mongodb';


/**
 * Configuration for MongoDB Offset DataSource
 */
export interface MongoDbOffsetDataSourceConfig<NodeType extends Document, ArgsForwardType, ArgsBackwardType> {
    /** Mongo Db */
    mongoDb: Db;
    /** Colleciton name */
    collectionName: string;
    /** Function to get collection field name for sorting. If not set `_id` is used */
    sortByFieldName?: (args: ArgsForwardType | ArgsBackwardType) => string;
    /** Additional filters on collection */
    filters?: (args: ArgsForwardType | ArgsBackwardType) => Filter<NodeType>[] | undefined;
}

/**
 * Offset DataSource for MongoDB.
 * Has to be wrapped by OffsetDataSourceWrapper to get correct offset in after/before methods!
 * 
 * Example:
 * 
 * ```ts
 * const mongoDs = new MongoDbOffsetDataSource<BookType>({ collectionName, mongoDb });
 * const dataSource = new OffsetDataSourceWrapper(mongoDs)
 * const booksPager = dataSourceLoaderPager({ dataSource }), 
 * ```
 */
export class MongoDbOffsetDataSource<NodeType extends Document,
    ArgsForwardType extends ArgsForward = ArgsForward,
    ArgsBackwardType extends ArgsBackward = ArgsBackward>
    extends DataSourceBase<NodeType, number, ArgsForwardType, ArgsBackwardType> {

    mongoDb: Db;
    collectionName: string;
    sortByFieldName?: MongoDbOffsetDataSourceConfig<NodeType, ArgsForwardType, ArgsBackwardType>['sortByFieldName'];
    filters?: MongoDbOffsetDataSourceConfig<NodeType, ArgsForwardType, ArgsBackwardType>['filters'];

    constructor(config: MongoDbOffsetDataSourceConfig<NodeType, ArgsForwardType, ArgsBackwardType>) {
        super("_id");
        this.mongoDb = config.mongoDb;
        this.collectionName = config.collectionName;
        this.sortByFieldName = config.sortByFieldName;
        this.filters = config.filters;
    }
    override getId(node: NodeType): number {
        return super.getId(node);
    }

    collection() {
        return this.mongoDb.collection<NodeType>(this.collectionName);
    }

    sortFieldName(args: ArgsForwardType | ArgsBackwardType): string {
        return this.sortByFieldName ? this.sortByFieldName(args) : "_id";
    }

    async after(afterId: number | undefined, size: number, args: ArgsForwardType): Promise<NodeType[]> {
        const conditions = this.filters && this.filters(args) || new Array();
        const query: Filter<NodeType> = conditions.length ? {
            "$and": conditions,
        } : {};

        const result = await this.collection().find(query)
            .sort({ [this.sortFieldName(args)]: 1 })
            .limit(size)
            .skip(afterId ? afterId : 0)
            .toArray();

        return result as NodeType[];
    }

    async before(beforeId: number | undefined, size: number, args: ArgsBackwardType): Promise<NodeType[]> {
        const conditions = this.filters && this.filters(args) || new Array();
        const query: Filter<NodeType> = conditions.length ? {
            "$and": conditions,
        } : {};

        const result = await this.collection().find(query)
            .sort({ [this.sortFieldName(args)]: -1 })
            .limit(size)
            .skip(beforeId ? beforeId : 0)
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
