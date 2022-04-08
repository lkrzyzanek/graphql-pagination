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


export class DataSourcePager implements CursorPager<any, string | number | Date> {

    ds: DataSource<any, any>;

    cursor: CursorEncoderDecoder<string | number | Date>;

    constructor(ds: DataSource<any, any>,
                cursorEncoderDecoder: CursorEncoderDecoder<string | number | Date> = new DefaultCursorEncoderDecoder()) {
        this.ds = ds;
        this.cursor = cursorEncoderDecoder;
    }

    forwardResolver(args: ArgsForward): Connection {
        let afterId;
        if (args.after) afterId = this.cursor.decode(args.after);

        const result = this.ds.after(afterId, args.first);

        return this.connectionObject(result, args, this.ds.totalCount());
    }

    backwardResolver(args: ArgsBackward): Connection {
        let beforeId;
        if (args.before) beforeId = this.cursor.decode(args.before);

        const result = this.ds.before(beforeId, args.last);

        return this.connectionObject(result, args, this.ds.totalCount());
    }

    connectionObject(nodes: any[], args: ArgsForward | ArgsBackward | any, totalCount: number): Connection {
        const edges = nodes.map(node => this.edgeObject(node))
        const connection = {
            totalCount: totalCount,
            edges,
            args,
        }
        const pageInfo = this.pageInfoObject(connection);
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

    pageInfoObject(connection: Connection): PageInfo {
        const startCursor = this.startCursor(connection.edges);
        const endCursor = this.endCursor(connection.edges);
        // TODO: Improve how hasNextPage & hasPreviousPage is determined
        let hasNextPage = false;
        let hasPreviousPage = false;
        if (connection.args.first) {
            // forward paging
            hasNextPage = connection.edges?.length >= connection.args.first;
            hasPreviousPage = !!connection.args.after;
        }
        if (connection.args.last) {
            // backward paging
            hasNextPage = connection.edges?.length >= connection.args.last;
            hasPreviousPage = !!connection.args.before;
        }

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
