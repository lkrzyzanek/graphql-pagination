import type {ArgsBackward, ArgsForward} from "../CursorPagerSpec";

/**
 * DataSource Spec
 */
export interface PagerDataSource<NodeType, IdType> {

    getId: (node: NodeType) => IdType;

    totalCount: (originalArgs: ArgsForward | ArgsBackward) => number

    after: (afterId: IdType | undefined, size: number, originalArgs: ArgsForward) => NodeType[]

    before: (beforeId: IdType | undefined, size: number, originalArgs: ArgsBackward) => NodeType[]

}

/**
 * Simple DataSource Page implementing `getId` method based on defining the id field name
 */
export abstract class DataSourceBase<NodeType, IdType> implements PagerDataSource<NodeType, IdType> {

    idFieldName: string;

    protected constructor(idFieldName: string = "id") {
        this.idFieldName = idFieldName;
    }

    abstract totalCount(originalArgs: ArgsForward | ArgsBackward): number;

    abstract after(afterId: IdType | undefined, size: number, originalArgs: ArgsForward): any[];

    abstract before(beforeId: IdType | undefined, size: number, originalArgs: ArgsBackward): any[];

    getId(node: any): IdType {
        return node[this.idFieldName];
    }

}
