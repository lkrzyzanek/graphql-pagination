import type {ArgsBackward, ArgsForward} from "../CursorPagerSpec";

/**
 * DataSource Spec
 */
export interface PagerDataSource<NodeType, IdType, ArgsForwardType extends ArgsForward, ArgsBackwardType extends ArgsBackward> {

    getId: (node: NodeType, args?: ArgsForwardType | ArgsBackwardType) => IdType;

    totalCount: (originalArgs: ArgsForwardType | ArgsBackwardType) => Promise<number>

    after: (afterId: IdType | undefined, size: number, originalArgs: ArgsForwardType) => Promise<NodeType[]>

    before: (beforeId: IdType | undefined, size: number, originalArgs: ArgsBackwardType) => Promise<NodeType[]>

}

/**
 * Simple DataSource Page implementing `getId` method based on defining the id field name
 */
export abstract class DataSourceBase<NodeType, IdType, ArgsForwardType extends ArgsForward, ArgsBackwardType extends ArgsBackward>
    implements PagerDataSource<NodeType, IdType, ArgsForwardType, ArgsBackwardType> {

    idFieldName: string;

    protected constructor(idFieldName: string = "id") {
        this.idFieldName = idFieldName;
    }

    abstract totalCount(originalArgs: ArgsForwardType | ArgsBackwardType): Promise<number>;

    abstract after(afterId: IdType | undefined, size: number, originalArgs: ArgsForwardType): Promise<NodeType[]>;

    abstract before(beforeId: IdType | undefined, size: number, originalArgs: ArgsBackwardType): Promise<NodeType[]>;

    getId(node: NodeType): IdType {
        const n = node as Record<string, unknown>;
        const result = n[this.idFieldName] as IdType;
        if (result == null) throw new Error(`No value for node's field '${this.idFieldName}'. Pager is probably not correctly configured.`);
        return result;
    }

}
