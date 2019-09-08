import {IMiddleware} from 'graphql-middleware';

const softDeletedMiddleware: IMiddleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
    const result = await resolve(root, args, context, info);
    if (result instanceof Array) {
        return result.filter(entity => !entity.deleted);
    } else {
        return result;
    }
};

export {softDeletedMiddleware};