import { GraphQLError } from 'graphql';
import { PolarisBaseContext } from './polaris-base-context';
import { PolarisExtensions } from './polaris-extensions';
import { PolarisGraphQLRequest } from './polaris-request';
import { PolarisWarning } from './polaris-warning';

export interface PolarisGraphQLContext extends PolarisBaseContext {
    request: PolarisGraphQLRequest;
    response: any;
    returnedExtensions: PolarisExtensions;
    errors?: GraphQLError[];
    warnings?: PolarisWarning[];
}
