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
    typeDef: PagerTypeDef

    /** GraphQL Resolvers - <TName>Connection.totalCount */
    resolvers: Record<string, any>;

}

export interface CursorPagerFn<NodeType, IdType> extends Omit<CursorPager<NodeType, IdType>, "typeDefs" | "typeDef" | "resolvers"> {
    typeDefs: () => string[]
    typeDef: () => PagerTypeDef
    resolvers: (dataSource?: PagerDataSource<NodeType, IdType>) => Record<string, any>
}
