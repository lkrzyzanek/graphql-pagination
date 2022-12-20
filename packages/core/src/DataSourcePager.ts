import type {
    ArgsBackward,
    ArgsForward,
    Connection,
    CursorEncoderDecoder,
    CursorPager,
    CursorPagerFn,
    Edge,
    PageInfo,
    PagerTypeDef
} from "./CursorPagerSpec";
import type { PagerDataSource } from "./datasource/DataSource";
import { DefaultCursorEncoderDecoder } from "./DefaultCursorEncoderDecoder";
import { createConnectionTypeDef, createEdgeTypeDef, createPageInfoTypeDef } from "./TypeDefs";

type validationArgFn = ((args: ArgsForward | any) => void);

/** DataSourcePager Configuration */
export interface DataSourcePagerConfig {
    /** DataSource. If not provided must be passed in resolver forward/backward functions */
    dataSource?: PagerDataSource<any, any>
    /** Type Name. If not provided GraphQL typeDefs are not generated */
    typeName?: string
    typeDefDirectives?: {
        pageInfo: string,
        connection: string,
        edge: string,
    }
    /** Cursor encoder/decoder. If not provided DefaultCursorEncoderDecoder used */
    cursor?: CursorEncoderDecoder<string | number | Date>
    /** Validation forward args function(s) */
    validateForwardArgs?: validationArgFn | [validationArgFn];
    /** Validation backward args function(s) */
    validateBackwardArgs?: validationArgFn | [validationArgFn];
    /** Define if totalCount should be fetched as part of forward/backward resolver */
    fetchTotalCountInResolver?: boolean;
}

/**
 * CursorPager implementation backed by DataSource. Wrapper of dataSourcePager function
 * @deprecated Use dataSourcePager function the same way
 */
export class DataSourcePager implements CursorPager<any, string | number | Date> {

    dataSource?: PagerDataSource<any, any>;
    cursor: CursorEncoderDecoder<string | number | Date>;
    typeDefs: string[] = [];
    typeDef: PagerTypeDef;
    resolvers: Record<string, any> = {};
    forwardResolver: (args: any, dataSource?: PagerDataSource<any, string | number | Date> | undefined) => Promise<Connection>;
    backwardResolver: (args: any, dataSource?: PagerDataSource<any, string | number | Date> | undefined) => Promise<Connection>;

    pager;

    constructor(config: DataSourcePagerConfig) {
        this.pager = dataSourcePager(config);
        this.cursor = this.pager.cursor;
        this.typeDef = this.pager.typeDef();
        this.typeDefs = this.pager.typeDefs();
        this.resolvers = this.pager.resolvers(config.dataSource);
        this.forwardResolver = this.pager.forwardResolver;
        this.backwardResolver = this.pager.backwardResolver;
    }

}

const defaultCursor = new DefaultCursorEncoderDecoder();

/**
 * CursorPager implementation backed by DataSource
 */
export function dataSourcePager(config?: DataSourcePagerConfig): CursorPagerFn<any, string | number | Date> {

    const cursor = config?.cursor || defaultCursor;
    let fetchTotalCountInResolver = true;
    if (config?.fetchTotalCountInResolver !== undefined) fetchTotalCountInResolver = config.fetchTotalCountInResolver;

    const getDataSource = (dataSource?: PagerDataSource<any, any>) => {
        const ds = dataSource || config?.dataSource;
        if (!ds) throw Error("No DataSource defined");
        return ds;
    }

    const forwardResolver = async (args: ArgsForward, dataSource?: PagerDataSource<any, any>): Promise<Connection> => {
        if (config?.validateForwardArgs) {
            if (Array.isArray(config.validateForwardArgs)) config.validateForwardArgs.forEach(validation => validation(args));
            else config.validateForwardArgs(args);
        }
        let afterId;
        if (args.after) afterId = cursor.decode(args.after);

        const ds = getDataSource(dataSource);
        const resultPlusOne = await ds.after(afterId, args.first + 1, args);

        const hasNextPage = resultPlusOne?.length > args.first;
        const hasPreviousPage = !!args.after;

        let totalCount;
        if (fetchTotalCountInResolver) totalCount = await ds.totalCount(args);

        return PagerObject.connectionObject(resultPlusOne.slice(0, args.first), args, totalCount, hasNextPage, hasPreviousPage, ds, cursor);
    }

    const backwardResolver = async (args: ArgsBackward, dataSource?: PagerDataSource<any, any>): Promise<Connection> => {
        if (config?.validateBackwardArgs) {
            if (Array.isArray(config.validateBackwardArgs)) config.validateBackwardArgs.forEach(validation => validation(args));
            else config.validateBackwardArgs(args);
        }
        let beforeId;
        if (args.before) beforeId = cursor.decode(args.before);

        const ds = getDataSource(dataSource);
        const resultPlusOne = await ds.before(beforeId, args.last + 1, args);

        const hasNextPage = resultPlusOne?.length > args.last;
        const hasPreviousPage = !!args.before;

        let totalCount;
        if (fetchTotalCountInResolver) totalCount = await ds.totalCount(args);

        return PagerObject.connectionObject(resultPlusOne.slice(0, args.last), args, totalCount, hasNextPage, hasPreviousPage, ds, cursor);
    }

    function typeDef(): PagerTypeDef {
        return {
            PageInfoType: createPageInfoTypeDef(config?.typeDefDirectives?.pageInfo),
            EdgeType: config?.typeName ? createEdgeTypeDef(config.typeName, config.typeDefDirectives?.edge) : undefined,
            ConnectionType: config?.typeName ? createConnectionTypeDef(config.typeName, config.typeDefDirectives?.connection) : undefined,
        };
    }

    function typeDefs(): string[] {
        const defs = typeDef();
        const result = [defs.PageInfoType];
        if (defs.EdgeType) result.push(defs.EdgeType);
        if (defs.ConnectionType) result.push(defs.ConnectionType);
        return result;
    }

    return {
        forwardResolver,
        backwardResolver,

        typeDef,
        typeDefs,

        resolvers: (dataSource?: PagerDataSource<any, any>): Record<string, any> => {
            if (!dataSource || !config?.typeName) return {};
            return {
                [`${config?.typeName}Connection`]: {
                    totalCount: (connection: Connection) => dataSource.totalCount(connection.args),
                }
            };
        },

        cursor,
    }
}

export const PagerObject = {
    connectionObject(nodes: any[], args: ArgsForward | ArgsBackward | any, totalCount: number | undefined, hasNextPage: boolean, hasPreviousPage: boolean,
        dataSource: PagerDataSource<any, any>, cursor: CursorEncoderDecoder<string | number | Date>): Connection {
        const edges = nodes.map(node => this.edgeObject(node, dataSource, cursor))
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
    },

    edgeObject(node: any, dataSource: PagerDataSource<any, any>, cursor: CursorEncoderDecoder<string | number | Date>): Edge {
        const plainId = dataSource.getId(node);
        return {
            cursor: cursor.encode(plainId),
            node
        };
    },

    pageInfoObject(connection: Connection, hasNextPage: boolean, hasPreviousPage: boolean): PageInfo {
        const startCursor = this.startCursor(connection.edges);
        const endCursor = this.endCursor(connection.edges);
        return {
            startCursor,
            endCursor,
            hasNextPage,
            hasPreviousPage,
        }
    },

    startCursor(edges: any[]): string | undefined {
        if (!edges || edges.length === 0) return;
        return edges[0].cursor;
    },

    endCursor(edges: any[]): string | undefined {
        if (!edges || edges.length === 0) return;
        return edges[edges.length - 1].cursor;
    },
}
