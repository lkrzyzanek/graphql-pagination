import type {
    ArgsBackward,
    ArgsForward,
    Connection,
    CursorEncoderDecoder,
    CursorPager,
    Edge,
    PageInfo
} from "./CursorPagerSpec";
import type {DataSource} from "./datasource/DataSource";
import {DefaultCursorEncoderDecoder} from "./DefaultCursorEncoderDecoder";
import {createConnectionTypeDef, createEdgeTypeDef, pageInfoTypeDef} from "./TypeDefs";

/** DataSourcePager Configuration */
export interface DataSourcePagerConfig {
    /** DataSource */
    dataSource: DataSource<any, any>
    /** Type Name. If not provided GraphQL TypeNames are not generated */
    typeName?: string
    /** Cursor encoder/decoder. If not provided DefaultCursorEncoderDecoder used */
    cursor?: CursorEncoderDecoder<string | number | Date>
}

/**
 * CursorPager implementation backed by DataSource
 */
export class DataSourcePager implements CursorPager<any, string | number | Date> {

    dataSource: DataSource<any, any>;

    cursor: CursorEncoderDecoder<string | number | Date>;

    typeDefs: string[] = [pageInfoTypeDef];

    constructor(config: DataSourcePagerConfig) {
        this.dataSource = config.dataSource;
        this.cursor = config.cursor || new DefaultCursorEncoderDecoder();

        if (config.typeName) {
            this.typeDefs.push(createEdgeTypeDef(config.typeName));
            this.typeDefs.push(createConnectionTypeDef(config.typeName));
        }
    }

    forwardResolver(args: ArgsForward): Connection {
        let afterId;
        if (args.after) afterId = this.cursor.decode(args.after);

        const resultPlusOne = this.dataSource.after(afterId, args.first + 1);

        const hasNextPage = resultPlusOne?.length > args.first;
        const hasPreviousPage = !!args.after;

        return this.connectionObject(resultPlusOne.slice(0, args.first), args, this.dataSource.totalCount(), hasNextPage, hasPreviousPage);
    }

    backwardResolver(args: ArgsBackward): Connection {
        let beforeId;
        if (args.before) beforeId = this.cursor.decode(args.before);

        const resultPlusOne = this.dataSource.before(beforeId, args.last + 1);

        const hasNextPage = resultPlusOne?.length > args.last;
        const hasPreviousPage = !!args.before;

        return this.connectionObject(resultPlusOne.slice(0, args.last), args, this.dataSource.totalCount(), hasNextPage, hasPreviousPage);
    }

    connectionObject(nodes: any[], args: ArgsForward | ArgsBackward | any, totalCount: number, hasNextPage: boolean, hasPreviousPage: boolean): Connection {
        const edges = nodes.map(node => this.edgeObject(node))
        const connection = {
            totalCount: totalCount,
            edges,
            args,
        }
        const pageInfo = this.pageInfoObject(connection, hasNextPage, hasPreviousPage);
        return {
            ...connection,
            pageInfo
        };
    }

    edgeObject(node: any): Edge {
        const plainId = this.dataSource.getId(node);
        return {
            cursor: this.cursor.encode(plainId),
            node
        };
    }

    pageInfoObject(connection: Connection, hasNextPage: boolean, hasPreviousPage: boolean): PageInfo {
        const startCursor = this.startCursor(connection.edges);
        const endCursor = this.endCursor(connection.edges);
        return {
            startCursor,
            endCursor,
            hasNextPage,
            hasPreviousPage,
        }
    }

    startCursor(edges: any[]): string | undefined {
        if (!edges || edges.length === 0) return;
        return edges[0].cursor;
    }

    endCursor(edges: any[]): string | undefined {
        if (!edges || edges.length === 0) return;
        return edges[edges.length - 1].cursor;
    }
}
