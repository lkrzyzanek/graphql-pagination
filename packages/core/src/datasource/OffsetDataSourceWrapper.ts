import {DataSourceBase, PagerDataSource} from "./DataSource";
import type {ArgsBackward, ArgsForward} from "../CursorPagerSpec";

/**
 * Offset based data source wrapper.
 * Wraps normal DataSource and stores index in data's structure which is used as DS's id.
 * Wrapped DS get index as afterId resp. beforeId arguments
 */
export class OffsetDataSourceWrapper<NodeType> extends DataSourceBase<NodeType, number> {

    ds;

    constructor(ds: PagerDataSource<NodeType, number>, indexFieldName: string = "_index") {
        super(indexFieldName);
        this.ds = ds;
    }

    async after(afterIndex: number | undefined, size: number, args: ArgsForward): Promise<NodeType[]> {
        const start = afterIndex != null ? afterIndex + 1 : 0;
        return this.ds.after(start, size, args).then(data => this.addIndexField(start, data));
    }

    async before(beforeIndex: number | undefined, size: number, args: ArgsBackward): Promise<NodeType[]> {
        const start = beforeIndex != null ? beforeIndex + 1 : 0;
        return this.ds.before(start, size, args).then(data => this.addIndexField(start, data));
    }

    async totalCount(args: ArgsForward | ArgsBackward) {
        return this.ds.totalCount(args);
    }

    async addIndexField(start: number, data: NodeType[]): Promise<NodeType[]> {
        if (data) {
            data.forEach((row, index) => {
                // @ts-ignore
                row[this.idFieldName] = start + index;
            });
        }
        return data;
    }

}
