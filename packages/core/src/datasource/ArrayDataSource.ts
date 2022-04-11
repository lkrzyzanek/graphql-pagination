import {DataSourceBase} from "./DataSource";
import type {ArgsBackward, ArgsForward} from "../CursorPagerSpec";

/**
 * Array backed DataSource.
 * ID field can be either `number` or `Date`
 * transformNodesFn can be used to filter / transform the original nodes
 */
export class ArrayDataSource<NodeType> extends DataSourceBase<NodeType, number | Date> {

    protected nodes: NodeType[]

    transformNodes: (nodes: NodeType[], originalArgs: ArgsForward | ArgsBackward) => NodeType[];

    /**
     * Create new ArrayDataSource
     * @param nodes array of your nodes (data)
     * @param idFieldName name of the field. Default is "id"
     * @param transformNodesFn additional transformation / filtration based on original arguments
     */
    constructor(nodes: NodeType[],
                idFieldName: string = "id",
                transformNodesFn?: (nodes: NodeType[], originalArgs: ArgsForward | ArgsBackward) => NodeType[]) {
        super(idFieldName);
        this.nodes = nodes;
        this.transformNodes = transformNodesFn || ((nodes) => nodes);
    }

    getNodes(nodes: NodeType[], originalArgs: ArgsForward | ArgsBackward): NodeType[] {
        return this.transformNodes(nodes, originalArgs);
    }

    totalCount(originalArgs: ArgsForward | ArgsBackward): number {
        return this.getNodes(this.nodes, originalArgs).length;
    }

    after(afterId: number | Date | undefined, size: number, originalArgs: ArgsForward): NodeType[] {
        return this.getNodes(this.nodes, originalArgs)
            .sort((a, b) => this.compareNodesId(a, b, true))
            .filter(node => !afterId ? true : this.getId(node) > afterId)
            .slice(0, size);
    }

    before(beforeId: number | Date | undefined, size: number, originalArgs: ArgsBackward): NodeType[] {
        return this.getNodes(this.nodes, originalArgs)
            .sort((a, b) => this.compareNodesId(a, b, false))
            .filter(node => !beforeId ? true : this.getId(node) < beforeId)
            .slice(0, size);
    }

    compareNodesId(a: NodeType, b: NodeType, asc: boolean = true): number {
        const idA = this.getId(a);
        const idB = this.getId(b);
        if (typeof idA === "number" && typeof idB === "number") {
            return asc ? idA - idB : idB - idA;
        }
        if (idA instanceof Date && idB instanceof Date) {
            return asc ? idA.getTime() - idB.getTime() : idB.getTime() - idA.getTime();
        }
        throw Error("Unknown type of id");
    }

}
