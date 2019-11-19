import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';

export class RealitiesMiddleware {
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
            const result = await resolve(root, args, context, info);
            const operationalRealityId: number = 0;
            context.requestHeaders.realityId = context.requestHeaders.realityId || 0;
            const noRealityIdOrSameAsHeader = (entity: any) =>
                entity.realityId === undefined ||
                entity.realityId === context.requestHeaders.realityId;
            if (!root) {
                if (Array.isArray(result)) {
                    return result.filter(noRealityIdOrSameAsHeader);
                } else {
                    if (noRealityIdOrSameAsHeader(result)) {
                        return result;
                    }
                }
            } else if (
                noRealityIdOrSameAsHeader(result) ||
                (context.requestHeaders.includeLinkedOper &&
                    result.realityId === operationalRealityId)
            ) {
                return result;
            }

            return null;
        };
    }
}
