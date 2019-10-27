import {GraphQLLogger} from '@enigmatis/polaris-graphql-logger';

interface PolarisBaseContext {
    irrelevantEntities?: any;
    dataVersion?: number;
    globalDataVersion?: number;
    logger?: GraphQLLogger;
    includeLinkedOper?: boolean;
    requestId?: string;
    upn?: string;
    realityId?: number;
    requestingSystemId?: string;
    requestingSystemName?: string;
}

export {PolarisBaseContext}
