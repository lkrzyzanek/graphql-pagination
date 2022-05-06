import {DataSourceBase} from "./DataSource";
import type {ArgsBackward, ArgsForward} from "../CursorPagerSpec";

/**
 * Array backed DataSource.
 * Array is passed directly or as async function
 * ID field can be either `number` or `Date` or `string`
 * transformNodesFn can be used to filter / transform the original nodes
 */
export class ArrayDataSource<NodeType> extends DataSourceBase<NodeType, number | Date | string> {

    /**
     * Create new ArrayDataSource
     * @param nodes array of your nodes (data) or async function to get them
     * @param idFieldName name of the field. Default is "id"
     * @param transformNodesFn additional transformation / filtration based on original arguments
     */
    constructor(nodes: NodeType[] | ((originalArgs: ArgsForward | ArgsBackward) => Promise<NodeType[]>),
                idFieldName: string = "id",
                transformNodesFn?: (nodes: NodeType[], originalArgs: ArgsForward | ArgsBackward) => NodeType[]) {
        super(idFieldName);
        if (Array.isArray(nodes)) {
            this.getNodes = (originalArgs) => Promise.resolve(nodes)
                .then(nodes => transformNodesFn ? transformNodesFn(nodes, originalArgs) : nodes);
        } else {
            this.getNodes = (originalArgs) => nodes(originalArgs)
                .then(nodes => transformNodesFn ? transformNodesFn(nodes, originalArgs) : nodes);
        }
    }

    getNodes: (originalArgs: ArgsForward | ArgsBackward) => Promise<NodeType[]>;

    async totalCount(originalArgs: ArgsForward | ArgsBackward): Promise<number> {
        return this.getNodes(originalArgs).then(nodes => nodes.length);
    }

    async after(afterId: number | Date | string | undefined, size: number, originalArgs: ArgsForward): Promise<NodeType[]> {
        const result = await this.getNodes(originalArgs);
        return result
            .sort((a, b) => this.compareNodesId(a, b, true))
            .filter(node => !afterId ? true : this.getId(node) > afterId)
            .slice(0, size);
    }

    async before(beforeId: number | Date | string | undefined, size: number, originalArgs: ArgsBackward): Promise<NodeType[]> {
        const result = await this.getNodes(originalArgs);
        return result
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
        if (typeof idA === "string" && typeof idB === "string") {
            return asc ? (idA).localeCompare(idB) : (idB).localeCompare(idA);
        }
        if (idA instanceof Date && idB instanceof Date) {
            return asc ? idA.getTime() - idB.getTime() : idB.getTime() - idA.getTime();
        }
        throw Error(`Type ${typeof idA} is not supported`);
    }

}
