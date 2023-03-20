import { DataSourceBase } from "./DataSource";
import type { ArgsBackward, ArgsForward } from "../CursorPagerSpec";

/**
 * Array backed DataSource.
 * Array is passed directly or as async function
 * ID field can be either `number` or `Date` or `string`
 * transformNodesFn can be used to filter / transform the original nodes
 */
export class ArrayDataSource<NodeType, IdType = number | Date | string,
    ArgsForwardType extends ArgsForward = ArgsForward,
    ArgsBackwardType extends ArgsBackward = ArgsBackward>
    extends DataSourceBase<NodeType, IdType, ArgsForwardType, ArgsBackwardType> {

    /**
     * Create new ArrayDataSource
     * @param nodes array of your nodes (data) or async function to get them
     * @param idFieldName name of the field. Default is "id"
     * @param transformNodesFn additional transformation / filtration based on original arguments
     */
    constructor(nodes: NodeType[] | ((originalArgs: ArgsForwardType | ArgsBackwardType) => Promise<NodeType[]>),
        idFieldName: string = "id",
        transformNodesFn?: (nodes: NodeType[], originalArgs: ArgsForwardType | ArgsBackwardType) => NodeType[]) {
        super(idFieldName);
        if (Array.isArray(nodes)) {
            this.getNodes = (originalArgs) => Promise.resolve(nodes)
                .then(nodes => transformNodesFn ? transformNodesFn(nodes, originalArgs) : nodes);
        } else {
            this.getNodes = (originalArgs) => nodes(originalArgs)
                .then(nodes => transformNodesFn ? transformNodesFn(nodes, originalArgs) : nodes);
        }
    }

    getNodes: (originalArgs: ArgsForwardType | ArgsBackwardType) => Promise<NodeType[]>;

    async totalCount(originalArgs: ArgsForwardType | ArgsBackwardType): Promise<number> {
        return this.getNodes(originalArgs).then(nodes => nodes.length);
    }

    async after(afterId: IdType | undefined, size: number, originalArgs: ArgsForwardType): Promise<NodeType[]> {
        const result = await this.getNodes(originalArgs);
        return result
            .sort((a, b) => this.compareNodesId(a, b, true))
            .filter(node => afterId === undefined || afterId === null ? true : this.getId(node) > afterId)
            .slice(0, size);
    }

    async before(beforeId: IdType | undefined, size: number, originalArgs: ArgsBackwardType): Promise<NodeType[]> {
        const result = await this.getNodes(originalArgs);
        return result
            .sort((a, b) => this.compareNodesId(a, b, false))
            .filter(node => beforeId === undefined || beforeId === null ? true : this.getId(node) < beforeId)
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
