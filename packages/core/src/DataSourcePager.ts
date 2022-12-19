import type {
    ArgsBackward,
    ArgsForward,
    Connection,
    CursorEncoderDecoder,
    CursorPager,
    Edge,
    PageInfo
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
 * CursorPager implementation backed by DataSource
 */
export class DataSourcePager implements CursorPager<any, string | number | Date> {

    dataSource?: PagerDataSource<any, any>;

    cursor: CursorEncoderDecoder<string | number | Date>;

    typeDefs: string[] = [];

    typeDef = {
        PageInfoType: "",
        EdgeType: "",
        ConnectionType: "",
    }

    resolvers: Record<string, any> = {};

    fetchTotalCountInResolver: boolean = true;

    constructor(config: DataSourcePagerConfig) {
        this.dataSource = config.dataSource;
        this.cursor = config.cursor || new DefaultCursorEncoderDecoder();
        if (config.fetchTotalCountInResolver !== undefined) this.fetchTotalCountInResolver = config.fetchTotalCountInResolver;

        this.typeDef.PageInfoType = createPageInfoTypeDef(config.typeDefDirectives?.pageInfo);
        this.typeDefs.push(this.typeDef.PageInfoType);
        if (config.typeName) {
            this.typeDef.EdgeType = createEdgeTypeDef(config.typeName, config.typeDefDirectives?.edge);
            this.typeDefs.push(this.typeDef.EdgeType);
            this.typeDef.ConnectionType = createConnectionTypeDef(config.typeName, config.typeDefDirectives?.connection);
            this.typeDefs.push(this.typeDef.ConnectionType);
            const ds = config.dataSource;
            if (ds && !config.fetchTotalCountInResolver) {
                this.resolvers = {
                    [`${config.typeName}Connection`]: {
                        totalCount: (connection: Connection) => ds.totalCount(connection.args),
                    }
                };
            }
        }
        if (config.validateForwardArgs) {
            if (Array.isArray(config.validateForwardArgs)) this.validateForwardArgs = config.validateForwardArgs;
            else this.validateForwardArgs = [config.validateForwardArgs];
        }
        if (config.validateBackwardArgs) {
            if (Array.isArray(config.validateBackwardArgs)) this.validateBackwardArgs = config.validateBackwardArgs;
            else this.validateBackwardArgs = [config.validateBackwardArgs];
        }
    }

    getDataSource(dataSource?: PagerDataSource<any, any>) {
        const ds = dataSource || this.dataSource;
        if (!ds) throw Error("No DataSource defined");
        return ds;
    }

    validateForwardArgs?: [validationArgFn];

    async forwardResolver(args: ArgsForward | any, dataSource?: PagerDataSource<any, any>): Promise<Connection> {
        if (this.validateForwardArgs) this.validateForwardArgs.forEach(validation => validation(args));

        let afterId;
        if (args.after) afterId = this.cursor.decode(args.after);


        const ds = this.getDataSource(dataSource);
        const resultPlusOne = await ds.after(afterId, args.first + 1, args);

        const hasNextPage = resultPlusOne?.length > args.first;
        const hasPreviousPage = !!args.after;

        let totalCount;
        if (this.fetchTotalCountInResolver) totalCount = await ds.totalCount(args);

        return this.connectionObject(resultPlusOne.slice(0, args.first), args, totalCount, hasNextPage, hasPreviousPage, ds);
    }

    validateBackwardArgs?: [validationArgFn];

    async backwardResolver(args: ArgsBackward | any, dataSource?: PagerDataSource<any, any>): Promise<Connection> {
        if (this.validateBackwardArgs) this.validateBackwardArgs.forEach(validation => validation(args));

        let beforeId;
        if (args.before) beforeId = this.cursor.decode(args.before);

        const ds = this.getDataSource(dataSource);
        const resultPlusOne = await ds.before(beforeId, args.last + 1, args);

        const hasNextPage = resultPlusOne?.length > args.last;
        const hasPreviousPage = !!args.before;

        let totalCount;
        if (this.fetchTotalCountInResolver) totalCount = await ds.totalCount(args);

        return this.connectionObject(resultPlusOne.slice(0, args.last), args, totalCount, hasNextPage, hasPreviousPage, ds);
    }

    connectionObject(nodes: any[], args: ArgsForward | ArgsBackward | any, totalCount: number | undefined, hasNextPage: boolean, hasPreviousPage: boolean, dataSource: PagerDataSource<any, any>): Connection {
        const edges = nodes.map(node => this.edgeObject(node, dataSource))
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

    edgeObject(node: any, dataSource: PagerDataSource<any, any>): Edge {
        const plainId = dataSource.getId(node);
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
