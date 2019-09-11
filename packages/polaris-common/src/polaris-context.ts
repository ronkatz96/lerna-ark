import {GraphQLLogger} from '@enigmatis/polaris-graphql-logger';

export interface PolarisBaseContext {
    irrelevantEntities?: any;
    dataVersion?: number;
    globalDataVersion?: number;
    logger?: GraphQLLogger;
}