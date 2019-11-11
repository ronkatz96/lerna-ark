import { PolarisGraphQLContext } from '@enigmatis/polaris-common';

export const softDeletedMiddleware = async (
    resolve: any,
    root: any,
    args: any,
    context: PolarisGraphQLContext,
    info: any,
) => {
    // if (context.logger) {
    //     context.logger.debug('Soft delete middleware started job', { context });
    // }
    const result = await resolve(root, args, context, info);
    let finalResult;
    if (result instanceof Array) {
        finalResult = result.filter(entity => !entity.deleted);
    } else {
        if (result && result.deleted) {
            finalResult = null;
        } else {
            finalResult = result;
        }
    }
    // if (context.logger) {
    //     context.logger.debug('Soft delete middleware finished job', { context });
    // }
    return finalResult;
};
