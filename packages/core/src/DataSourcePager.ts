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

/**
 * CursorPager implementation backed by DataSource
 */
export class DataSourcePager implements CursorPager<any, string | number | Date> {

    ds: DataSource<any, any>;

    cursor: CursorEncoderDecoder<string | number | Date>;

    typeDefs: string[] = [pageInfoTypeDef];

    constructor(ds: DataSource<any, any>,
                typeName?: string,
                cursorEncoderDecoder?: CursorEncoderDecoder<string | number | Date>) {
        this.ds = ds;
        this.cursor = cursorEncoderDecoder || new DefaultCursorEncoderDecoder();

        if (typeName) {
            this.typeDefs.push(createEdgeTypeDef(typeName));
            this.typeDefs.push(createConnectionTypeDef(typeName));
        }
    }

    forwardResolver(args: ArgsForward): Connection {
        let afterId;
        if (args.after) afterId = this.cursor.decode(args.after);

        const resultPlusOne = this.ds.after(afterId, args.first + 1);

        const hasNextPage = resultPlusOne?.length > args.first;
        const hasPreviousPage = !!args.after;

        return this.connectionObject(resultPlusOne.slice(0, args.first), args, this.ds.totalCount(), hasNextPage, hasPreviousPage);
    }

    backwardResolver(args: ArgsBackward): Connection {
        let beforeId;
        if (args.before) beforeId = this.cursor.decode(args.before);

        const resultPlusOne = this.ds.before(beforeId, args.last + 1);

        const hasNextPage = resultPlusOne?.length > args.last;
        const hasPreviousPage = !!args.before;

        return this.connectionObject(resultPlusOne.slice(0, args.last), args, this.ds.totalCount(), hasNextPage, hasPreviousPage);
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
        const plainId = this.ds.getId(node);
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
