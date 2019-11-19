import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';

export class SoftDeleteMiddleware {
    readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    getMiddleware() {
        return async (
            resolve: any,
            root: any,
            args: any,
            context: PolarisGraphQLContext,
            info: any,
        ) => {
            this.logger.debug('Soft delete middleware started job', { context });
            const result = await resolve(root, args, context, info);
            let finalResult = result;
            if (Array.isArray(result)) {
                finalResult = result.filter(entity => !entity.deleted);
            } else {
                if (result && result.deleted) {
                    finalResult = null;
                }
            }
            this.logger.debug('Soft delete middleware finished job', { context });
            return finalResult;
        };
    }
}
