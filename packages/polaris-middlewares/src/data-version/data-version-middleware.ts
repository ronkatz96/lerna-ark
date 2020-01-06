import { DATA_VERSION, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { Connection, DataVersion, getConnectionManager } from '@enigmatis/polaris-typeorm';

export class DataVersionMiddleware {
    public readonly connection?: Connection;
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger, connection?: Connection) {
        this.connection = connection;
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
            if (
                !root &&
                context &&
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
        const connection = getConnectionManager().get();
        if (!connection) {
            return;
        }
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
