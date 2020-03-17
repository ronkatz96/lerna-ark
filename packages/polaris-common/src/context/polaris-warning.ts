import { ApolloError } from 'apollo-server-errors';

export interface PolarisWarning {
    message: string | ApolloError;
    path?: string[];
}
