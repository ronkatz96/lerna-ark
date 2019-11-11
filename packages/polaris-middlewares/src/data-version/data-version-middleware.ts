import { DATA_VERSION, PolarisGraphQLContext } from '@enigmatis/polaris-common';

export const dataVersionMiddleware = async (
    resolve: any,
    root: any,
    args: any,
    context: PolarisGraphQLContext,
    info: any,
) => {
    // if (context.logger) {
    //     context.logger.debug('Data version middleware started job', { context });
    // }
    const result = await resolve(root, args, context, info);
    let finalResult;
    if (!root && context.requestHeaders.dataVersion && !isNaN(context.requestHeaders.dataVersion)) {
        if (Array.isArray(result)) {
            finalResult = result.filter(entity =>
                entity.dataVersion && context.requestHeaders.dataVersion
                    ? entity.dataVersion > context.requestHeaders.dataVersion
                    : entity,
            );
        } else if (
            !result.dataVersion ||
            (result.dataVersion &&
                context.requestHeaders.dataVersion &&
                result.dataVersion > context.requestHeaders.dataVersion)
        ) {
            finalResult = result;
        }
    } else {
        finalResult = result;
    }
    // if (context.logger) {
    //     context.logger.debug('Data version middleware finished job', { context });
    // }
    return finalResult;
};

export const initContextForDataVersion = async ({ req }: any) => {
    return {
        dataVersion: req.headers[DATA_VERSION],
    };
};
