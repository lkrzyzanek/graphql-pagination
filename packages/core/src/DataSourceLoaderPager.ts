import type { ArgsForward, ArgsBackward, Connection } from "./CursorPagerSpec";
import { DataSourceCursorPager, dataSourcePager, DataSourcePagerConfig } from "./DataSourcePager";
import Dataloader from "dataloader";


export type DataLoaderConfig<ArgsForwardType extends ArgsForward, ArgsBackwardType extends ArgsBackward, NodeType = any> = {
    forward?: Dataloader.Options<ArgsForwardType, Connection<NodeType>, string>
    backward?: Dataloader.Options<ArgsBackwardType, Connection<NodeType>, string>
    count?: Dataloader.Options<ArgsForwardType | ArgsBackwardType, number, string>
};

export type DataSourceLoaderPagerConfig<
    NodeType, IdType, ArgsForwardType extends ArgsForward, ArgsBackwardType extends ArgsBackward
> = DataSourcePagerConfig<NodeType, IdType, ArgsForwardType, ArgsBackwardType> & {
    dataloader?: DataLoaderConfig<ArgsForwardType, ArgsBackwardType>
}
/**
 * Datasource pager wrapped by data loader. Shorthand for `dataloaderPagerWrapper(dataSourcePager(config))`
 * @param config pager config & dataloader config
 * @returns pager wrapped by dataloader
 * @see dataloaderPagerWrapper
 */
export function dataSourceLoaderPager<NodeType,
    IdType = string | number | Date,
    ArgsForwardType extends ArgsForward = ArgsForward,
    ArgsBackwardType extends ArgsBackward = ArgsBackward>
    (config?: DataSourceLoaderPagerConfig<NodeType, IdType, ArgsForwardType, ArgsBackwardType>): DataSourceCursorPager<NodeType, IdType, ArgsForwardType, ArgsBackwardType> {

    const pager = dataSourcePager<NodeType, IdType, ArgsForwardType, ArgsBackwardType>(config);
    const wrapper = dataloaderPagerWrapper(pager, config?.dataloader);

    return wrapper;
}

/**
 * Pager wrapper by dataloader. Beware of memoization!. Cache key is computed as strintify of args object
 * @param pager original pager
 * @param config dataloader configuration
 * @returns pager with wrapped forwardResolver, backwardResolver, totalCount functions
 */
export function dataloaderPagerWrapper<NodeType,
    IdType = string | number | Date,
    ArgsForwardType extends ArgsForward = ArgsForward,
    ArgsBackwardType extends ArgsBackward = ArgsBackward>(
        pager: DataSourceCursorPager<NodeType, IdType, ArgsForwardType, ArgsBackwardType>,
        config?: DataLoaderConfig<ArgsForwardType, ArgsBackwardType>
    ): DataSourceCursorPager<NodeType, IdType, ArgsForwardType, ArgsBackwardType> {

    const forwardLoader = new Dataloader<ArgsForwardType, Connection<NodeType>, string>(async (args) => {
        return Promise.all(args.map(arg => pager.forwardResolver(arg)));
    }, {
        ...config?.forward,
        cacheKeyFn: (key) => JSON.stringify(key)
    });
    const backwardLoader = new Dataloader<ArgsBackwardType, Connection<NodeType>, string>(async (args) => {
        return Promise.all(args.map(arg => pager.backwardResolver(arg)));
    }, {
        ...config?.backward,
        cacheKeyFn: (key) => JSON.stringify(key)
    });

    const countLoader = new Dataloader<ArgsForwardType | ArgsBackwardType, number, string>(async (args) => {
        return Promise.all(args.map(arg => pager.totalCount(arg)));
    }, {
        ...config?.count,
        cacheKeyFn: (key) => {
            return JSON.stringify({
                ...key,
                after: undefined,
                before: undefined,
                first: undefined,
                last: undefined,
            })
        }
    });

    return {
        ...pager,
        forwardResolver: (arg) => forwardLoader.load(arg),
        backwardResolver: (arg) => backwardLoader.load(arg),
        totalCount: (arg) => countLoader.load(arg),
    };
}
