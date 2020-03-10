import { GraphQLSchema } from 'graphql';
import {
    IResolvers,
    ITypeDefinitions,
    makeExecutableSchema,
    SchemaDirectiveVisitor,
} from 'graphql-tools';
import { getMergedPolarisResolvers } from './merge-resolvers';
import { getMergedPolarisTypes } from './merge-types';

export function makeExecutablePolarisSchema(
    typeDefs: ITypeDefinitions,
    resolvers?: IResolvers | IResolvers[],
    schemaDirectives?: Record<string, typeof SchemaDirectiveVisitor>,
): GraphQLSchema {
    const mergedTypes = getMergedPolarisTypes(typeDefs);
    const mergedResolvers = getMergedPolarisResolvers(resolvers);

    return makeExecutableSchema({
        typeDefs: mergedTypes,
        resolvers: mergedResolvers,
        resolverValidationOptions: {
            requireResolversForResolveType: false,
        },
        schemaDirectives,
    });
}
