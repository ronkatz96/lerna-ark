import { IResolvers } from 'graphql-tools';
import { mergeResolvers } from 'merge-graphql-schemas';
import { scalarsResolvers } from '../scalars/scalars-resolvers';

export const getMergedPolarisResolvers = (resolvers?: IResolvers | IResolvers[]): IResolvers => {
    if (resolvers) {
        return Array.isArray(resolvers)
            ? mergeResolvers([scalarsResolvers, ...resolvers])
            : mergeResolvers([scalarsResolvers, resolvers]);
    } else {
        return scalarsResolvers;
    }
};
