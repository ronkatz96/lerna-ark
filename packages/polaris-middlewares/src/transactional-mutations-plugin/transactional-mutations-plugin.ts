import { PolarisGraphQLContext, RealitiesHolder } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { ApolloServerPlugin, GraphQLRequestContext, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { getConnectionForReality } from '../utills/connection-retriever';
import { isMutation } from '../utills/query-util';
import { TransactionalMutationsListener } from './transactional-mutations-listener';
import { PLUGIN_STARTED_JOB } from './transactional-mutations-messages';

export class TransactionalMutationsPlugin implements ApolloServerPlugin<PolarisGraphQLContext> {
    private readonly logger: PolarisGraphQLLogger;
    private readonly realitiesHolder: RealitiesHolder;

    constructor(logger: PolarisGraphQLLogger, realitiesHolder: RealitiesHolder) {
        this.logger = logger;
        this.realitiesHolder = realitiesHolder;
    }

    public requestDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext>,
    ): GraphQLRequestListener<PolarisGraphQLContext> | void {
        if (isMutation(requestContext.request.query)) {
            this.logger.debug(PLUGIN_STARTED_JOB, requestContext.context);
            const realityId = requestContext.context.requestHeaders.realityId !== undefined ? requestContext.context.requestHeaders.realityId : 0;
            const queryRunner = getConnectionForReality(realityId, this.realitiesHolder).manager.queryRunner;
            try {
                if (!queryRunner?.isTransactionActive) {
                    queryRunner?.startTransaction();
                    return new TransactionalMutationsListener(this.logger, queryRunner);
                }
            } catch (err) {
                this.logger.error(err.message, requestContext.context);
                queryRunner?.rollbackTransaction();
                throw err;
            }
        }
    }
}
