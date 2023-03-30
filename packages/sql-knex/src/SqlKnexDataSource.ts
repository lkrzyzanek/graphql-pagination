import type { ArgsBackward, ArgsForward } from "@graphql-pagination/core";
import { DataSourceBase } from "@graphql-pagination/core";
import type { Knex } from "knex";


export interface SqlKnexDataSourceConfig<NodeType extends {}, ArgsForwardType, ArgsBackwardType> {
    /** Knex instance */
    knex: Knex<NodeType>;
    /** Table name */
    tableName: string;
    /** Column name acting as ID for cursor paging */
    idColumnName?: string;
    /** Override baseQuery. Useful for joins or additional filtration */
    baseQuery?: (originalArgs: ArgsForwardType | ArgsBackwardType) => Knex.QueryBuilder<NodeType>;
}

/**
 * Knex.js powered SQL DataSource
 */
export class SqlKnexDataSource<NodeType extends {}, IdType = number | Date,
    ArgsForwardType extends ArgsForward = ArgsForward,
    ArgsBackwardType extends ArgsBackward = ArgsBackward>
    extends DataSourceBase<NodeType, IdType, ArgsForwardType, ArgsBackwardType> {

    knex: Knex;
    tableName: string;
    baseQuery: (originalArgs: ArgsForwardType | ArgsBackwardType) => Knex.QueryBuilder;

    defaultBaseQuery(_originalArgs: ArgsForwardType | ArgsBackwardType): Knex.QueryBuilder {
        return this.knex(this.tableName);
    }

    constructor(config: SqlKnexDataSourceConfig<NodeType, ArgsForwardType, ArgsBackwardType>) {
        super(config.idColumnName);
        this.knex = config.knex;
        this.tableName = config.tableName;
        this.baseQuery = config.baseQuery || this.defaultBaseQuery;
    }

    async after(afterId: IdType | undefined, size: number, originalArgs: ArgsForwardType): Promise<NodeType[]> {
        return this.baseQuery(originalArgs)
            .where(builder => {
                if (afterId) builder.where(this.idFieldName, '>', afterId)
            })
            .orderBy(this.idFieldName, "asc")
            .limit(size);
    }

    async before(beforeId: IdType | undefined, size: number, originalArgs: ArgsBackwardType): Promise<NodeType[]> {
        return this.baseQuery(originalArgs)
            .where(builder => {
                if (beforeId) builder.where(this.idFieldName, '<', beforeId)
            })
            .orderBy(this.idFieldName, "desc")
            .limit(size);
    }

    async totalCount(originalArgs: ArgsForwardType | ArgsBackwardType): Promise<number> {
        return this.baseQuery(originalArgs)
            .count(this.idFieldName, { as: 'totalCount' })
            .then(result => Number(result[0].totalCount));
    }

}