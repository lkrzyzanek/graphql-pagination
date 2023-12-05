import { DataSourceBase, PagerDataSource } from "./DataSource";
import type { ArgsBackward, ArgsForward } from "../CursorPagerSpec";

/**
 * Offset based data source wrapper.
 * Wraps normal DataSource and stores index in data's structure which is used as DS's id.
 * Wrapped DS get index as afterId resp. beforeId arguments
 */
export class OffsetDataSourceWrapper<NodeType,
    ArgsForwardType extends ArgsForward = ArgsForward,
    ArgsBackwardType extends ArgsBackward = ArgsBackward>
    extends DataSourceBase<NodeType, number, ArgsForwardType, ArgsBackwardType> {

    ds;

    constructor(ds: PagerDataSource<NodeType, number, ArgsForwardType, ArgsBackwardType>, indexFieldName: string = "_index") {
        super(indexFieldName);
        this.ds = ds;
    }

    async after(afterIndex: number | undefined, size: number, args: ArgsForwardType): Promise<NodeType[]> {
        let start = afterIndex != null ? afterIndex + 1 : 0;
        start = args.page && args.page > 1 ? ((args.page - 1) * (size - 1)) : start;
        return this.ds.after(start, size, args).then(data => this.addIndexField(start, data));
    }

    async before(beforeIndex: number | undefined, size: number, args: ArgsBackwardType): Promise<NodeType[]> {
        let start = beforeIndex != null ? beforeIndex + 1 : 0;
        start = args.page && args.page > 1 ? ((args.page - 1) * (size - 1)) : start;
        return this.ds.before(start, size, args).then(data => this.addIndexField(start, data));
    }

    async totalCount(args: ArgsForwardType | ArgsBackwardType) {
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
