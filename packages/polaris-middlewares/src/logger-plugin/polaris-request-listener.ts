import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { GraphQLRequestContext, GraphQLRequestListener } from 'apollo-server-plugin-base';
import {
    EXECUTION_BEGAN,
    EXECUTION_FINISHED,
    EXECUTION_FINISHED_WITH_ERROR,
    PARSING_BEGAN,
    PARSING_FINISHED,
    PARSING_FINISHED_WITH_ERROR,
    RESPONSE_SENT,
    VALIDATION_BEGAN,
    VALIDATION_FINISHED,
    VALIDATION_FINISHED_WITH_ERROR,
} from './logger-plugin-messages';

export class PolarisRequestListener implements GraphQLRequestListener<PolarisGraphQLContext> {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public willSendResponse(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<Pick<GraphQLRequestContext<PolarisGraphQLContext>, 'metrics' | 'response'>>,
    ): Promise<void> | void {
        const { context, response } = requestContext;
        const loggedResponse = {
            data: response.data,
            errors: response.errors,
            extensions: response.extensions,
        };
        this.logger.info(RESPONSE_SENT, context, {
            response: loggedResponse,
        });
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
        this.logger.debug(EXECUTION_BEGAN, context);
        return err => {
            if (err) {
                this.logger.debug(EXECUTION_FINISHED_WITH_ERROR, context);
            } else {
                this.logger.debug(EXECUTION_FINISHED, context);
            }
        };
    }

    public parsingDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<Pick<GraphQLRequestContext<PolarisGraphQLContext>, 'metrics' | 'source'>>,
    ): ((err?: Error) => void) | void {
        const { context } = requestContext;
        this.logger.debug(PARSING_BEGAN, context);
        return err => {
            if (err) {
                this.logger.debug(PARSING_FINISHED_WITH_ERROR, context);
            } else {
                this.logger.debug(PARSING_FINISHED, context);
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
        this.logger.debug(VALIDATION_BEGAN, context);
        return err => {
            if (err) {
                this.logger.debug(VALIDATION_FINISHED_WITH_ERROR, context);
            } else {
                this.logger.debug(VALIDATION_FINISHED, context);
            }
        };
    }
}
