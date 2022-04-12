import {DataSource} from "apollo-datasource";
import type {Connection, CursorEncoderDecoder, DataSourcePagerConfig, Edge, PageInfo} from "@graphql-pagination/core";
import {CursorPager, DataSourcePager} from "@graphql-pagination/core";

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
    }

    backwardResolver(args: any): Connection {
        return this.pager.backwardResolver(args);
    }

    connectionObject(nodes: any[], args: any, totalCount: number, hasNextPage: boolean, hasPreviousPage: boolean): Connection {
        return this.pager.connectionObject(nodes, args, totalCount, hasNextPage, hasPreviousPage);
    }

    cursor: CursorEncoderDecoder<string | number | Date>;

    edgeObject(node: any): Edge {
        return this.pager.edgeObject(node);
    }

    forwardResolver(args: any): Connection {
        return this.pager.forwardResolver(args);
    }

    pageInfoObject(connection: Connection, hasNextPage: boolean, hasPreviousPage: boolean): PageInfo {
        return this.pager.pageInfoObject(connection, hasNextPage, hasPreviousPage);
    }

    typeDefs: string[];

}
