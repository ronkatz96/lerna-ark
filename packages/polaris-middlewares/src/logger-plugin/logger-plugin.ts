import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    ApolloServerPlugin,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { loggerPluginMessages } from './logger-plugin-messages';
import { RequestListenerForLoggerPlugin } from './request-listener-for-logger';

export class LoggerPlugin implements ApolloServerPlugin {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public requestDidStart = (
        requestContext: GraphQLRequestContext,
    ): GraphQLRequestListener | void => {
        this.logger.info(loggerPluginMessages.requestReceived, {
            context: requestContext.context as PolarisGraphQLContext,
            polarisLogProperties: {
                request: {
                    request: requestContext.request,
                },
            },
        });
        return new RequestListenerForLoggerPlugin(this.logger);
    };
}
