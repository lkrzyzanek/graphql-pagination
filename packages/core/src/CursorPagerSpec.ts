import type { PagerDataSource } from "./datasource/DataSource";

/**
 * Connection object
 * @see https://relay.dev/graphql/connections.htm#sec-Connection-Types.Fields
 */
export interface Connection {
    totalCount: number | undefined;
    edges: Edge[];
    args: any;
    pageInfo?: PageInfo;
}

/**
 * Edge object
 * @see https://relay.dev/graphql/connections.htm#sec-Edge-Types.Fields
 */
export interface Edge {
    cursor: string;
    node: any;
}

/**
 * PageInfo object
 * @see https://relay.dev/graphql/connections.htm#sec-undefined.PageInfo.Fields
 */
export interface PageInfo {
    hasPreviousPage: Boolean
    hasNextPage: Boolean
    startCursor?: String
    endCursor?: String
}

/**
 * Forward pagination arguments
 * @see https://relay.dev/graphql/connections.htm#sec-Forward-pagination-arguments
 */
export interface ArgsForward {
    first: number
    after?: string
}

/**
 * Backward pagination arguments
 * @see https://relay.dev/graphql/connections.htm#sec-Backward-pagination-arguments
 */
export interface ArgsBackward {
    last: number,
    before?: string
}


export interface CursorEncoderDecoder<IdType> {
    encode: (plainCursor: IdType) => string;
    decode: (encodedCursor: string) => IdType;
}


/**
 * Cursor Pager spec
 */
export interface CursorPager<NodeType, IdType> {

    // Main Resolvers

    forwardResolver: (args: ArgsForward | any, dataSource?: PagerDataSource<NodeType, IdType>) => Promise<Connection>;

    backwardResolver: (args: ArgsBackward | any, dataSource?: PagerDataSource<NodeType, IdType>) => Promise<Connection>;

    // Cursor Helper

    /**
     * Cursor encoder / decoder
     */
    cursor: CursorEncoderDecoder<IdType>;

    /** GraphQL Type Defs - PageInfo, <TName>Connection, <TName>Edge, */
    typeDefs: string[];

    /** Individual GraphQL TypeDefs */
    typeDef: {
        PageInfoType: string;
        EdgeType: string;
        ConnectionType: string;
    };

    /** GraphQL Resolvers - <TName>Connection.totalCount */
    resolvers: Record<string, any>;

}
