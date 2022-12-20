import { DataSource } from "apollo-datasource";
import type { Connection, CursorEncoderDecoder, DataSourcePagerConfig, PagerDataSource, PagerTypeDef } from "@graphql-pagination/core";
import { CursorPager, dataSourcePager } from "@graphql-pagination/core";
import { UserInputError } from "apollo-server-errors";

/**
 * CursorPager extending Apollo DataSource class to be used as Apollo's datasource.
 */
export class ApolloDataSourcePager<TContext> extends DataSource<TContext> implements CursorPager<any, string | number | Date> {


    dataSource?: PagerDataSource<any, any>;

    cursor: CursorEncoderDecoder<string | number | Date>;

    typeDefs: string[] = [];

    typeDef: PagerTypeDef;

    resolvers: Record<string, any> = {};

    pager;

    constructor(config: DataSourcePagerConfig) {
        super();
        this.pager = dataSourcePager(config);
        this.cursor = this.pager.cursor;
        this.typeDef = this.pager.typeDef();
        this.typeDefs = this.pager.typeDefs();
        this.resolvers = this.pager.resolvers(config.dataSource);
    }

    async forwardResolver(args: any, dataSource?: PagerDataSource<any, string | number | Date>): Promise<Connection> {
        return this.pager.forwardResolver(args, dataSource)
            .catch(e => {
                if (e.message === "Invalid cursor value") {
                    throw new UserInputError(e.message, { "argumentName": "after" })
                }
                throw e;
            });
    }

    async backwardResolver(args: any, dataSource?: PagerDataSource<any, string | number | Date>): Promise<Connection> {
        return this.pager.backwardResolver(args, dataSource)
            .catch(e => {
                if (e.message === "Invalid cursor value") {
                    throw new UserInputError(e.message, { "argumentName": "before" })
                }
                throw e;
            });
    }
}
