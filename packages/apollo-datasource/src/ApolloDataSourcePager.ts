import {DataSource} from "apollo-datasource";
import type {Connection, CursorEncoderDecoder, DataSourcePagerConfig, Edge, PageInfo} from "@graphql-pagination/core";
import {CursorPager, DataSourcePager} from "@graphql-pagination/core";
import {UserInputError} from "apollo-server-errors";

/**
 * CursorPager extending Apollo DataSource class to be used as Apollo's datasource.
 */
export class ApolloDataSourcePager<TContext> extends DataSource<TContext> implements CursorPager<any, string | number | Date> {

    pager: DataSourcePager;

    constructor(config: DataSourcePagerConfig) {
        super();
        this.pager = new DataSourcePager(config);
        this.cursor = this.pager.cursor;
        this.typeDefs = this.pager.typeDefs;
        this.resolvers = this.pager.resolvers;
    }

    async backwardResolver(args: any): Promise<Connection> {
        return this.pager.backwardResolver(args)
            .catch(e => {
                if (e.message === "Invalid cursor value") {
                    throw new UserInputError(e.message, {"argumentName": "before"})
                }
                throw e;
            });
    }

    connectionObject(nodes: any[], args: any, totalCount: number | undefined, hasNextPage: boolean, hasPreviousPage: boolean): Connection {
        return this.pager.connectionObject(nodes, args, totalCount, hasNextPage, hasPreviousPage);
    }

    cursor: CursorEncoderDecoder<string | number | Date>;

    edgeObject(node: any): Edge {
        return this.pager.edgeObject(node);
    }

    async forwardResolver(args: any): Promise<Connection> {
        return this.pager.forwardResolver(args)
            .catch(e => {
                if (e.message === "Invalid cursor value") {
                    throw new UserInputError(e.message, {"argumentName": "after"})
                }
                throw e;
            });
    }

    pageInfoObject(connection: Connection, hasNextPage: boolean, hasPreviousPage: boolean): PageInfo {
        return this.pager.pageInfoObject(connection, hasNextPage, hasPreviousPage);
    }

    typeDefs: string[];

    resolvers: any[];

}
