import { PolarisGraphQLContext, RealitiesHolder } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { Connection, DataVersion, getConnectionManager } from '@enigmatis/polaris-typeorm';
import { getConnectionForReality } from '../utills/connection-retriever';

export class DataVersionMiddleware {
    public readonly connection?: Connection;
    public readonly realitiesHolder: RealitiesHolder;
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger, realitiesHolder: RealitiesHolder, connection?: Connection) {
        this.connection = connection;
        this.realitiesHolder = realitiesHolder;
        this.logger = logger;
    }

    public getMiddleware() {
        return async (
            resolve: any,
            root: any,
            args: any,
            context: PolarisGraphQLContext,
            info: any,
        ) => {
            this.logger.debug('Data version middleware started job', { context });
            const result = await resolve(root, args, context, info);
            let finalResult = result;
            context = context || {};
            if (
                !root &&
                context.requestHeaders &&
                context.requestHeaders.dataVersion &&
                !isNaN(context.requestHeaders.dataVersion) &&
                result !== undefined &&
                result !== null
            ) {
                if (Array.isArray(result)) {
                    finalResult = result.filter(entity =>
                        entity.dataVersion && context.requestHeaders.dataVersion
                            ? entity.dataVersion > context.requestHeaders.dataVersion
                            : entity,
                    );
                } else if (
                    !(
                        (result.dataVersion &&
                            context.requestHeaders.dataVersion &&
                            result.dataVersion > context.requestHeaders.dataVersion) ||
                        !result.dataVersion
                    )
                ) {
                    finalResult = undefined;
                }
            }
            await this.updateDataVersionInReturnedExtensions(context);
            this.logger.debug('Data version middleware finished job', { context });
            return finalResult;
        };
    }

    public async updateDataVersionInReturnedExtensions(context: PolarisGraphQLContext) {
        if (context?.requestHeaders?.realityId == null || getConnectionManager().connections.length === 0) {
            return;
        }
        const connection = getConnectionForReality(context?.requestHeaders?.realityId, this.realitiesHolder);
        if (connection) {
            const dataVersionRepo = connection.getRepository(DataVersion);
            const globalDataVersion: any = await dataVersionRepo.findOne();
            if (globalDataVersion) {
                context.returnedExtensions = {
                    ...context.returnedExtensions,
                    globalDataVersion: globalDataVersion.getValue(),
                };
            } else {
                throw new Error('no data version found in db');
            }
        }
    }
}
