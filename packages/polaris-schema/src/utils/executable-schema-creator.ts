import {GraphQLSchema} from "graphql";
import {mergeResolvers, mergeTypes} from "merge-graphql-schemas";
import {makeExecutableSchema} from "graphql-tools";
import {repositoryEntityTypeDefs} from "../common/repository-entity-type-defs";
import {scalarsTypeDefs} from "../scalars/scalars-type-defs";
import {scalarsResolvers} from "../scalars/scalars-resolvers";

export function getExecutablePolarisSchema(typeDefs: object[], resolvers: object[]): GraphQLSchema {
    const polarisTypeDefs: any = mergeTypes(
        [repositoryEntityTypeDefs, scalarsTypeDefs, ...typeDefs],
        {
            all: true,
        },
    );

    const polarisResolvers: any = mergeResolvers(scalarsResolvers, ...resolvers);


    return makeExecutableSchema({
        typeDefs: polarisTypeDefs,
        resolvers: polarisResolvers,
    });
}
