export function createPageInfoTypeDef(directive: string = ""): string {
    return `
        """
        Pagination info object
        """
        type PageInfo ${directive} {
            hasNextPage: Boolean!
            hasPreviousPage: Boolean!
            startCursor: String
            endCursor: String
        }
    `;
}

export function createEdgeTypeDef(typeName: string, directive: string = ""): string {
    return `
        """
        ${typeName} pagination edge object
        """
        type ${typeName}Edge ${directive} {
            node: ${typeName}!
            """Cursor of the node"""
            cursor: String!
        }
    `;
}

export function createConnectionTypeDef(typeName: string, directive: string = ""): string {
    return `
        """
        ${typeName} pagination connection object
        """
        type ${typeName}Connection ${directive} {
            totalCount: Int!
            edges: [${typeName}Edge!]
            pageInfo: PageInfo!
        }
    `;
}

