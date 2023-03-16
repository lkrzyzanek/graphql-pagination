import gql from "graphql-tag";

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
export interface DataSourcePagerConfig<NodeType, IdType = string | number | Date> {
    /** DataSource. If not provided must be passed in resolver forward/backward functions */
    dataSource?: PagerDataSource<NodeType, IdType>
    /** Type Name. If not provided GraphQL typeDefs are not generated */
    typeName?: string
    typeDefDirectives?: {
        pageInfo: string,
        connection: string,
        edge: string,
    }
    /** Cursor encoder/decoder. If not provided DefaultCursorEncoderDecoder used */
    cursor?: CursorEncoderDecoder<IdType>
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
export class DataSourcePager<NodeType, IdType = string | number | Date> implements CursorPager<NodeType, IdType> {

    dataSource?: PagerDataSource<NodeType, IdType>;
    cursor: CursorEncoderDecoder<IdType>;
    typeDefs: string[] = [];
    typeDef: PagerTypeDef;
    resolvers: Record<string, any> = {};
    forwardResolver: (args: ArgsForward | any, dataSource?: PagerDataSource<NodeType, IdType>) => Promise<Connection>;
    backwardResolver: (args: ArgsBackward | any, dataSource?: PagerDataSource<NodeType, IdType>) => Promise<Connection>;

    pager;

    constructor(config: DataSourcePagerConfig<NodeType, IdType>) {
        this.pager = dataSourcePager<NodeType, IdType>(config);
        this.cursor = this.pager.cursor;
        this.typeDef = this.pager.typeDef();
        this.typeDefs = this.pager.typeDefs();
        this.resolvers = this.pager.resolvers(config.dataSource);
        this.forwardResolver = this.pager.forwardResolver;
        this.backwardResolver = this.pager.backwardResolver;
    }

}


/**
 * CursorPager implementation backed by DataSource
 */
export function dataSourcePager<NodeType, IdType = string | number | Date>(config?: DataSourcePagerConfig<NodeType, IdType>): CursorPagerFn<NodeType, IdType> {

    const defaultCursor = new DefaultCursorEncoderDecoder<IdType>();

    const cursor = config?.cursor || defaultCursor;
    let fetchTotalCountInResolver = true;
    if (config?.fetchTotalCountInResolver !== undefined) fetchTotalCountInResolver = config.fetchTotalCountInResolver;

    const getDataSource = (dataSource?: PagerDataSource<NodeType, IdType>) => {
        const ds = dataSource || config?.dataSource;
        if (!ds) throw Error("No DataSource defined");
        return ds;
    }

    async function forwardResolver(args: ArgsForward, dataSource?: PagerDataSource<NodeType, IdType>): Promise<Connection> {
        if (config?.validateForwardArgs) {
            if (Array.isArray(config.validateForwardArgs)) config.validateForwardArgs.forEach(validation => validation(args));
            else config.validateForwardArgs(args);
        }
        let afterId: IdType | undefined;
        if (args.after) afterId = cursor.decode(args.after);

        const ds = getDataSource(dataSource);
        const resultPlusOne = await ds.after(afterId, args.first + 1, args);

        const hasNextPage = resultPlusOne?.length > args.first;
        const hasPreviousPage = !!args.after;

        let totalCount;
        if (fetchTotalCountInResolver) totalCount = await ds.totalCount(args);

        return PagerObject.connectionObject(resultPlusOne.slice(0, args.first), args, totalCount, hasNextPage, hasPreviousPage, ds, cursor);
    }

    async function backwardResolver(args: ArgsBackward, dataSource?: PagerDataSource<NodeType, IdType>): Promise<Connection> {
        if (config?.validateBackwardArgs) {
            if (Array.isArray(config.validateBackwardArgs)) config.validateBackwardArgs.forEach(validation => validation(args));
            else config.validateBackwardArgs(args);
        }
        let beforeId: IdType | undefined;
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
        const typeDefs = {
            PageInfoType: createPageInfoTypeDef(config?.typeDefDirectives?.pageInfo),
            EdgeType: config?.typeName ? createEdgeTypeDef(config.typeName, config.typeDefDirectives?.edge) : undefined,
            ConnectionType: config?.typeName ? createConnectionTypeDef(config.typeName, config.typeDefDirectives?.connection) : undefined,
        };
        return {
            ...typeDefs,
            PageInfoTypeObj: gql(typeDefs.PageInfoType),
            EdgeTypeObj: typeDefs.EdgeType ? gql(typeDefs.EdgeType) : undefined,
            ConnectionTypeObj: typeDefs?.ConnectionType ? gql(typeDefs.ConnectionType) : undefined,
        }
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

        resolvers: (dataSource?: PagerDataSource<NodeType, IdType>): Record<string, any> => {
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
    connectionObject<NodeType, IdType>(nodes: any[], args: ArgsForward | ArgsBackward | any, totalCount: number | undefined, hasNextPage: boolean, hasPreviousPage: boolean,
        dataSource: PagerDataSource<NodeType, IdType>, cursor: CursorEncoderDecoder<IdType>): Connection {
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

    edgeObject<NodeType, IdType>(node: any, dataSource: PagerDataSource<NodeType, IdType>, cursor: CursorEncoderDecoder<IdType>): Edge {
        const plainId = dataSource.getId(node);
        return {
            cursor: cursor.encode(plainId),
            node
        };
    },

    pageInfoObject(connection: Omit<Connection, "pageInfo">, hasNextPage: boolean, hasPreviousPage: boolean): PageInfo {
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
