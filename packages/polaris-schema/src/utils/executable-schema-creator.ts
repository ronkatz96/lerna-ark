import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { mergeResolvers, mergeTypes } from 'merge-graphql-schemas';
import { repositoryEntityTypeDefs } from '../common/repository-entity-type-defs';
import { scalarsResolvers } from '../scalars/scalars-resolvers';
import { scalarsTypeDefs } from '../scalars/scalars-type-defs';

export function makeExecutablePolarisSchema(typeDefs: any, resolvers: any): GraphQLSchema {
    const polarisTypeDefs: any = mergeTypes([repositoryEntityTypeDefs, scalarsTypeDefs, typeDefs], {
        all: true,
    });

    const polarisResolvers: any = mergeResolvers([scalarsResolvers, resolvers]);

    return makeExecutableSchema({
        typeDefs: polarisTypeDefs,
        resolvers: polarisResolvers,
        resolverValidationOptions: {
            requireResolversForResolveType: false,
        },
    });
}
