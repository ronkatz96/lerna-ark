const softDeletedMiddleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
    const result = await resolve(root, args, context, info);
    if (result instanceof Array) {
        return result.filter(entity => !entity.deleted);
    } else {
        if (result.deleted) {
            return null;
        }
        return result;
    }
};

export {softDeletedMiddleware};