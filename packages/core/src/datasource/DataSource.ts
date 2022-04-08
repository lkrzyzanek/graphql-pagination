/**
 * DataSource Spec
 */
export interface DataSource<NodeType, IdType> {

    getId: (node: NodeType) => IdType;

    totalCount: () => number

    after: (afterId: IdType | undefined, size: number) => NodeType[]

    before: (beforeId: IdType | undefined, size: number) => NodeType[]

}

/**
 * Simple DataSource Page implementing `getId` method based on either defining the id field name or getId function
 */
export abstract class DataSourceBase<NodeType, IdType> implements DataSource<NodeType, IdType> {

    getIdFn: ((node: any) => IdType) | undefined;

    idFieldName: string;

    protected constructor(idFieldName?: string, getIdFn?: (node: any) => IdType) {
        this.getIdFn = getIdFn;
        this.idFieldName = idFieldName || "id";
    }

    abstract totalCount(): number;

    abstract after(afterId: IdType | undefined, size: number): any[];

    abstract before(beforeId: IdType | undefined, size: number): any[];

    getId(node: any): IdType {
        if (this.getIdFn) return this.getIdFn(node);
        return node[this.idFieldName];
    }

}
