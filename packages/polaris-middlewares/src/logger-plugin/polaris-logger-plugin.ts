import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    ApolloServerPlugin,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { loggerPluginMessages } from './logger-plugin-messages';
import { PolarisRequestListener } from './polaris-request-listener';

export class PolarisLoggerPlugin implements ApolloServerPlugin<PolarisGraphQLContext> {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public requestDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext>,
    ): GraphQLRequestListener<PolarisGraphQLContext> | void {
        const { context } = requestContext;
        this.logger.info(loggerPluginMessages.requestReceived, context);
        return new PolarisRequestListener(this.logger);
    }
}
