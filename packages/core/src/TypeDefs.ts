export const pageInfoTypeDef = /* GraphQL */`
    """
    Pagination info object
    """
    type PageInfo {
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
        startCursor: String
        endCursor: String
    }
`;

export function createEdgeTypeDef(typeName: string): string {
    return `
        """
        ${typeName} pagination edge object
        """
        type ${typeName}Edge {
            node: ${typeName}!
            """Cursor of the node"""
            cursor: String!
        }
    `;
}

export function createConnectionTypeDef(typeName: string): string {
    return `
        """
        ${typeName} pagination connection object
        """
        type ${typeName}Connection {
            totalCount: Int!
            edges: [${typeName}Edge!]
            pageInfo: PageInfo!
        }
    `;
}
