import { mergeTypeDefs } from '@graphql-tools/merge';
import schemaTypeDefs from './schema.gql';
import { typeDefs as scalarTypeDefs } from "graphql-scalars";
import { dataSourcePager } from '@graphql-pagination/core';

const booksPagerTypeDefs = dataSourcePager({
    typeName: 'Book',
    typeDefDirectives: {
        edge: '@cacheControl(inheritMaxAge: true)',
        pageInfo: '@cacheControl(inheritMaxAge: true)',
        connection: '@cacheControl(inheritMaxAge: true)',
    },
}).typeDefs();

const typeDefs = mergeTypeDefs([schemaTypeDefs, booksPagerTypeDefs, scalarTypeDefs]);

export default typeDefs;
