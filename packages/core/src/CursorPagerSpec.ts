import type { DocumentNode } from "graphql";
import type { PagerDataSource } from "./datasource/DataSource";

/**
 * Connection object
 * @see https://relay.dev/graphql/connections.htm#sec-Connection-Types.Fields
 */
export interface Connection {
    totalCount: number | undefined;
    edges: Edge[];
    args: any;
    pageInfo: PageInfo;
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
    hasPreviousPage: boolean
    hasNextPage: boolean
    startCursor?: string
    endCursor?: string
}

/**
 * Forward pagination arguments
 * @see https://relay.dev/graphql/connections.htm#sec-Forward-pagination-arguments
 */
export interface ArgsForward {
    first: number
    after?: string
    page?: number
}

/**
 * Backward pagination arguments
 * @see https://relay.dev/graphql/connections.htm#sec-Backward-pagination-arguments
 */
export interface ArgsBackward {
    last: number,
    before?: string
    page?: number
}


export interface CursorEncoderDecoder<IdType> {
    encode: (plainCursor: IdType) => string;
    decode: (encodedCursor: string) => IdType;
}

export interface PagerTypeDef {
    PageInfoType: string;
    PageInfoTypeObj: DocumentNode;
    EdgeType: string | undefined;
    EdgeTypeObj: DocumentNode | undefined;
    ConnectionType: string | undefined;
    ConnectionTypeObj: DocumentNode | undefined;
}

/**
 * Cursor Pager spec
 */
export interface CursorPager<NodeType, IdType, ArgsForwardType extends ArgsForward, ArgsBackwardType extends ArgsBackward> {

    // Main Resolvers

    forwardResolver: (args: ArgsForwardType, dataSource?: PagerDataSource<NodeType, IdType, ArgsForwardType, ArgsBackwardType>) => Promise<Connection>;

    backwardResolver: (args: ArgsBackwardType, dataSource?: PagerDataSource<NodeType, IdType, ArgsForwardType, ArgsBackwardType>) => Promise<Connection>;

    // Cursor Helper

    /**
     * Cursor encoder / decoder
     */
    cursor: CursorEncoderDecoder<IdType>;

    /** GraphQL Type Defs - PageInfo, <TName>Connection, <TName>Edge, */
    typeDefs: () => string[]

    /** Individual GraphQL TypeDefs */
    typeDef: () => PagerTypeDef

    /** GraphQL Resolvers - <TName>Connection.totalCount */
    resolvers: (dataSource?: PagerDataSource<NodeType, IdType, ArgsForwardType, ArgsBackwardType>) => Record<string, any>
}
