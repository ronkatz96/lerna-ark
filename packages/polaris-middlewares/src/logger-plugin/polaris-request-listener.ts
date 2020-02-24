import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { GraphQLRequestContext, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { loggerPluginMessages } from './logger-plugin-messages';

export class PolarisRequestListener
    implements GraphQLRequestListener<PolarisGraphQLContext> {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public willSendResponse(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<Pick<GraphQLRequestContext<PolarisGraphQLContext>, 'metrics' | 'response'>>,
    ): Promise<void> | void {
        const { context } = requestContext;
        this.logger.info(loggerPluginMessages.responseSent, context);
    }

    public executionDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
    ): ((err?: Error) => void) | void {
        const { context } = requestContext;
        this.logger.debug(loggerPluginMessages.executionBegan, context);
        return err => {
            if (err) {
                this.logger.debug(loggerPluginMessages.executionFinishedWithError, context);
            } else {
                this.logger.debug(loggerPluginMessages.executionFinished, context);
            }
        };
    }

    public parsingDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<Pick<GraphQLRequestContext<PolarisGraphQLContext>, 'metrics' | 'source'>>,
    ): ((err?: Error) => void) | void {
        const { context } = requestContext;
        this.logger.debug(loggerPluginMessages.parsingBegan, context);
        return err => {
            if (err) {
                this.logger.debug(loggerPluginMessages.parsingFinishedWithError, context);
            } else {
                this.logger.debug(loggerPluginMessages.parsingFinished, context);
            }
        };
    }

    public validationDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document'
                >
            >,
    ): ((err?: ReadonlyArray<Error>) => void) | void {
        const { context } = requestContext;
        this.logger.debug(loggerPluginMessages.validationBegan, context);
        return err => {
            if (err) {
                this.logger.debug(loggerPluginMessages.validationFinishedWithError, context);
            } else {
                this.logger.debug(loggerPluginMessages.validationFinished, context);
            }
        };
    }
}
