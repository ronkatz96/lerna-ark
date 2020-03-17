import { ApolloError } from 'apollo-server-errors';

export interface PolarisExtensions {
    globalDataVersion: number;
    irrelevantEntities?: any;
    warnings?: Array<ApolloError | string>;
}
