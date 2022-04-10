import {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLString, printType} from "graphql";

export const PageInfoObjectTypeDef = new GraphQLObjectType({
    name: "PageInfo",
    fields: {
        hasNextPage: {type: new GraphQLNonNull(GraphQLBoolean)},
        hasPreviousPage: {type: new GraphQLNonNull(GraphQLBoolean)},
        startCursor: {type: GraphQLString},
        endCursor: {type: GraphQLString},
    },
});
export const pageInfoTypeDef = printType(PageInfoObjectTypeDef);

export function createEdgeTypeDef(typeName: string): string {
    return `
        type ${typeName}Edge {
            node: ${typeName}!
            cursor: String!
        }
    `;
}

export function createConnectionTypeDef(typeName: string): string {
    return `
        type ${typeName}Connection {
            totalCount: Int!
            edges: [${typeName}Edge!]
            pageInfo: PageInfo!
        }
    `;
}