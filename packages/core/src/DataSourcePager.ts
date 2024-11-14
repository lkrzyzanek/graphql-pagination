import gql from "graphql-tag";

import type {
    ArgsBackward,
    ArgsForward,
    Connection,
    CursorEncoderDecoder,
    CursorPager,
    Edge,
    PageInfo,
    PagerTypeDef
} from "./CursorPagerSpec";
import type { PagerDataSource } from "./datasource/DataSource";
import { DefaultCursorEncoderDecoder } from "./DefaultCursorEncoderDecoder";
import { createConnectionTypeDef, createEdgeTypeDef, createPageInfoTypeDef } from "./TypeDefs";
import { GraphQLError } from "graphql";

type validationArgFn = ((args: ArgsForward | any) => void);

/** DataSourcePager Configuration */
export interface DataSourcePagerConfig<NodeType, IdType = string | number | Date,
    ArgsForwardType extends ArgsForward = ArgsForward,
    ArgsBackwardType extends ArgsBackward = ArgsBackward> {
    /** DataSource. If not provided must be passed in resolver forward/backward functions */
    dataSource?: PagerDataSource<NodeType, IdType, ArgsForwardType, ArgsBackwardType>
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

export type DataSourceCursorPager<NodeType, IdType,
    ArgsForwardType extends ArgsForward = ArgsForward,
    ArgsBackwardType extends ArgsBackward = ArgsBackward
> = CursorPager<NodeType, IdType, ArgsForwardType, ArgsBackwardType> & {
    totalCount(args: ArgsForwardType | ArgsBackwardType, dataSource?: PagerDataSource<NodeType, IdType, ArgsForwardType, ArgsBackwardType>): Promise<number>
}

/**
 * CursorPager implementation backed by DataSource
 */
export function dataSourcePager<NodeType,
    IdType = string | number | Date,
    ArgsForwardType extends ArgsForward = ArgsForward,
    ArgsBackwardType extends ArgsBackward = ArgsBackward>
    (config?: DataSourcePagerConfig<NodeType, IdType, ArgsForwardType, ArgsBackwardType>)
    : DataSourceCursorPager<NodeType, IdType, ArgsForwardType, ArgsBackwardType> {

    const defaultCursor = new DefaultCursorEncoderDecoder<IdType>();

    const cursor = config?.cursor || defaultCursor;
    let fetchTotalCountInResolver = true;
    if (config?.fetchTotalCountInResolver !== undefined) fetchTotalCountInResolver = config.fetchTotalCountInResolver;

    const getDataSource = (dataSource?: PagerDataSource<NodeType, IdType, ArgsForwardType, ArgsBackwardType>) => {
        const ds = dataSource || config?.dataSource;
        if (!ds) throw Error("No DataSource defined");
        return ds;
    }

    async function totalCount(args: ArgsForwardType | ArgsBackwardType, dataSource?: PagerDataSource<NodeType, IdType, ArgsForwardType, ArgsBackwardType>) {
        const ds = getDataSource(dataSource);
        return await ds.totalCount(args);
    }

    async function forwardResolver(args: ArgsForwardType, dataSource?: PagerDataSource<NodeType, IdType, ArgsForwardType, ArgsBackwardType>): Promise<Connection<NodeType>> {
        if (config?.validateForwardArgs) {
            if (Array.isArray(config.validateForwardArgs)) config.validateForwardArgs.forEach(validation => validation(args));
            else config.validateForwardArgs(args);
        }
        if (args.first < 0) throw new GraphQLError("first argument has to be a non-negative number", { extensions: { code: "BAD_USER_INPUT" } });
        if (args.page != undefined && args.page <= 0) throw new GraphQLError("page argument has to be a positive number", { extensions: { code: "BAD_USER_INPUT" } });

        let afterId: IdType | undefined;
        if (args.after) afterId = cursor.decode(args.after);

        const ds = getDataSource(dataSource);
        const resultPlusOne = await ds.after(afterId, args.first + 1, args);

        const hasNextPage = resultPlusOne?.length > args.first;
        let hasPreviousPage = !!args.after;
        if (args.page) hasPreviousPage = args.page > 1;

        let count;
        if (fetchTotalCountInResolver) count = await totalCount(args, ds);

        return PagerObject.connectionObject(resultPlusOne.slice(0, args.first), args, count, hasNextPage, hasPreviousPage, ds, cursor);
    }

    async function backwardResolver(args: ArgsBackwardType, dataSource?: PagerDataSource<NodeType, IdType, ArgsForwardType, ArgsBackwardType>): Promise<Connection<NodeType>> {
        if (config?.validateBackwardArgs) {
            if (Array.isArray(config.validateBackwardArgs)) config.validateBackwardArgs.forEach(validation => validation(args));
            else config.validateBackwardArgs(args);
        }
        if (args.last < 0) throw new GraphQLError("last argument has to be a non-negative number", { extensions: { code: "BAD_USER_INPUT" } });
        if (args.page != undefined && args.page <= 0) throw new GraphQLError("page argument has to be a positive number", { extensions: { code: "BAD_USER_INPUT" } });

        let beforeId: IdType | undefined;
        if (args.before) beforeId = cursor.decode(args.before);

        const ds = getDataSource(dataSource);
        const resultPlusOne = await ds.before(beforeId, args.last + 1, args);

        const hasNextPage = resultPlusOne?.length > args.last;
        let hasPreviousPage = !!args.before;
        if (args.page) hasPreviousPage = args.page > 1;

        let count;
        if (fetchTotalCountInResolver) count = await totalCount(args, ds);

        return PagerObject.connectionObject(resultPlusOne.slice(0, args.last), args, count, hasNextPage, hasPreviousPage, ds, cursor);
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
        totalCount,

        typeDef,
        typeDefs,

        resolvers: (dataSource?: PagerDataSource<NodeType, IdType, ArgsForwardType, ArgsBackwardType>): Record<string, any> => {
            const ds = getDataSource(dataSource);
            if (!ds || !config?.typeName) return {};
            return {
                [`${config?.typeName}Connection`]: {
                    totalCount: (connection: Connection<NodeType>) => ds.totalCount(connection.args),
                }
            };
        },

        cursor,
    }
}

export const PagerObject = {
    connectionObject<NodeType, IdType, ArgsForwardType extends ArgsForward, ArgsBackwardType extends ArgsBackward>(
        nodes: any[], args: ArgsForward | ArgsBackward | any, totalCount: number | undefined, hasNextPage: boolean, hasPreviousPage: boolean,
        dataSource: PagerDataSource<NodeType, IdType, ArgsForwardType, ArgsBackwardType>, cursor: CursorEncoderDecoder<IdType>): Connection<NodeType> {
        const edges = nodes.map(node => this.edgeObject(node, dataSource, cursor, args))
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

    edgeObject<NodeType, IdType, ArgsForwardType extends ArgsForward, ArgsBackwardType extends ArgsBackward>(node: any,
        dataSource: PagerDataSource<NodeType, IdType, ArgsForwardType, ArgsBackwardType>, cursor: CursorEncoderDecoder<IdType>, args?: ArgsForwardType | ArgsBackwardType): Edge<NodeType> {
        const plainId = dataSource.getId(node, args);
        return {
            cursor: cursor.encode(plainId),
            node
        };
    },

    pageInfoObject<NodeType = any>(connection: Omit<Connection<NodeType>, "pageInfo">, hasNextPage: boolean, hasPreviousPage: boolean): PageInfo {
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
        if (!edges || edges.length === 0) return undefined;
        return edges[0].cursor;
    },

    endCursor(edges: any[]): string | undefined {
        if (!edges || edges.length === 0) return undefined;
        return edges[edges.length - 1].cursor;
    },
}
