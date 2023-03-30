// Importing required modules
import { ApolloServer } from '@apollo/server';

// Importing the typedefs and resolver functions
import resolvers from './resolvers';
import typeDefs from './typeDefs';
import type { DataSourceContext } from './types/DataSourceContext';

export const server = new ApolloServer<DataSourceContext>({ typeDefs, resolvers });
