import {DataSourceBase} from "./DataSource";

/**
 * Array backed DataSource.
 * ID field can be either `number` or `Date`
 */
export class ArrayDataSource<NodeType> extends DataSourceBase<NodeType, number | Date> {

    protected nodes: NodeType[]

    constructor(nodes: NodeType[], idFieldName?: string, getIdFn?: (node: any) => number | Date) {
        super(idFieldName, getIdFn);
        this.nodes = nodes;
    }

    totalCount(): number {
        return this.nodes.length;
    }

    after(afterId: number | Date | undefined, size: number): NodeType[] {
        return this.nodes
            .sort((a, b) => this.compareNodesId(a, b, true))
            .filter(node => !afterId ? true : this.getId(node) > afterId)
            .slice(0, size);
    }

    before(beforeId: number | Date | undefined, size: number): NodeType[] {
        return this.nodes
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
