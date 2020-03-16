import { GraphQLError } from 'graphql';
import { Reality } from '..';
import { PolarisBaseContext } from './polaris-base-context';
import { PolarisExtensions } from './polaris-extensions';
import { PolarisGraphQLRequest } from './polaris-request';

export interface PolarisGraphQLContext extends PolarisBaseContext {
    request: PolarisGraphQLRequest;
    returnedExtensions: PolarisExtensions;
    reality: Reality;
    errors?: GraphQLError[];
}
