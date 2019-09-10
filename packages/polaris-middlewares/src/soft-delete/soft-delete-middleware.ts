const softDeletedMiddleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
    context.logger ? context.logger.debug("Soft delete middleware started job") : {};
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
    context.logger ? context.logger.debug("Soft delete middleware finished job") : {};
    return finalResult;
};

export {softDeletedMiddleware};