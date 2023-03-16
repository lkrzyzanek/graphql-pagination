import type {ArgsBackward, ArgsForward} from "@graphql-pagination/core";
import {DataSourceBase} from "@graphql-pagination/core";
import type {Knex} from "knex";


export interface SqlKnexDataSourceConfig {
    /** Knex instance */
    knex: Knex;
    /** Table name */
    tableName: string;
    /** Column name acting as ID for cursor paging */
    idColumnName?: string;
    /** Override baseQuery. Useful for joins or additional filtration */
    baseQuery?: (originalArgs: ArgsForward | ArgsBackward) => Knex.QueryBuilder;
}

/**
 * Knex.js powered SQL DataSource
 */
export class SqlKnexDataSource<NodeType extends {}, IdType = number | Date> extends DataSourceBase<NodeType, IdType> {

    knex: Knex;
    tableName: string;
    baseQuery: (originalArgs: ArgsForward | ArgsBackward) => Knex.QueryBuilder;

    //@ts-ignore
    defaultBaseQuery(originalArgs: ArgsForward | ArgsBackward): Knex.QueryBuilder<NodeType> {
        return this.knex<NodeType>(this.tableName);
    }

    constructor(config: SqlKnexDataSourceConfig) {
        super(config.idColumnName);
        this.knex = config.knex;
        this.tableName = config.tableName;
        this.baseQuery = config.baseQuery || this.defaultBaseQuery;
    }

    async after(afterId: IdType | undefined, size: number, originalArgs: ArgsForward): Promise<NodeType[]> {
        return this.baseQuery(originalArgs)
            .where(builder => {
                if (afterId) builder.where(this.idFieldName, '>', afterId)
            })
            .orderBy(this.idFieldName, "asc")
            .limit(size);
    }

    async before(beforeId: IdType | undefined, size: number, originalArgs: ArgsBackward): Promise<NodeType[]> {
        return this.baseQuery(originalArgs)
            .where(builder => {
                if (beforeId) builder.where(this.idFieldName, '<', beforeId)
            })
            .orderBy(this.idFieldName, "desc")
            .limit(size);
    }

    async totalCount(originalArgs: ArgsForward | ArgsBackward): Promise<number> {
        return this.baseQuery(originalArgs)
            .count(this.idFieldName, {as: 'totalCount'})
            .then(result => Number(result[0].totalCount));
    }

}