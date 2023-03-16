import type {ArgsBackward, ArgsForward} from "../CursorPagerSpec";

/**
 * DataSource Spec
 */
export interface PagerDataSource<NodeType, IdType> {

    getId: (node: NodeType) => IdType;

    totalCount: (originalArgs: ArgsForward | ArgsBackward) => Promise<number>

    after: (afterId: IdType | undefined, size: number, originalArgs: ArgsForward) => Promise<NodeType[]>

    before: (beforeId: IdType | undefined, size: number, originalArgs: ArgsBackward) => Promise<NodeType[]>

}

/**
 * Simple DataSource Page implementing `getId` method based on defining the id field name
 */
export abstract class DataSourceBase<NodeType, IdType> implements PagerDataSource<NodeType, IdType> {

    idFieldName: string;

    protected constructor(idFieldName: string = "id") {
        this.idFieldName = idFieldName;
    }

    abstract totalCount(originalArgs: ArgsForward | ArgsBackward): Promise<number>;

    abstract after(afterId: IdType | undefined, size: number, originalArgs: ArgsForward): Promise<NodeType[]>;

    abstract before(beforeId: IdType | undefined, size: number, originalArgs: ArgsBackward): Promise<NodeType[]>;

    getId(node: NodeType): IdType {
        const n = node as Record<string, unknown>;
        const result = n[this.idFieldName] as IdType;
        if (result == null) throw new Error(`No value for node's field '${this.idFieldName}'. Pager is probably not correctly configured.`);
        return result;
    }

}
