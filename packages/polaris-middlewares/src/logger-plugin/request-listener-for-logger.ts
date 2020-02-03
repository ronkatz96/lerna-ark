import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { GraphQLRequestContext, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { loggerPluginMessages } from './logger-plugin-messages';

export class RequestListenerForLoggerPlugin implements GraphQLRequestListener {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public willSendResponse = async (requestContext: any) => {
        const {
            context,
            response,
        }: { context: PolarisGraphQLContext; response: any } = requestContext;
        this.logger.info(loggerPluginMessages.responseSent, {
            context,
            polarisLogProperties: {
                response,
            },
        });
        return requestContext;
    };

    public executionDidStart(
        requestContext: GraphQLRequestContext &
            Required<
                Pick<
                    GraphQLRequestContext,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
    ): ((err?: Error) => void) | void {
        this.logger.debug(loggerPluginMessages.executionBegan, {
            context: requestContext.context as PolarisGraphQLContext,
        });
        return err => {
            if (err) {
                this.logger.debug(loggerPluginMessages.executionFinishedWithError);
            } else {
                this.logger.debug(loggerPluginMessages.executionFinished);
            }
        };
    }

    public parsingDidStart(
        requestContext: GraphQLRequestContext &
            Required<Pick<GraphQLRequestContext, 'metrics' | 'source'>>,
    ): ((err?: Error) => void) | void {
        this.logger.debug(loggerPluginMessages.parsingBegan, {
            context: requestContext.context as PolarisGraphQLContext,
        });
        return err => {
            if (err) {
                this.logger.debug(loggerPluginMessages.parsingFinishedWithError);
            } else {
                this.logger.debug(loggerPluginMessages.parsingFinished);
            }
        };
    }

    public validationDidStart(
        requestContext: GraphQLRequestContext &
            Required<Pick<GraphQLRequestContext, 'metrics' | 'source' | 'document'>>,
    ): ((err?: ReadonlyArray<Error>) => void) | void {
        this.logger.debug(loggerPluginMessages.validationBegan, {
            context: requestContext.context as PolarisGraphQLContext,
        });
        return err => {
            if (err) {
                this.logger.debug(loggerPluginMessages.validationFinishedWithError);
            } else {
                this.logger.debug(loggerPluginMessages.validationFinished);
            }
        };
    }
}
