import {DeltaMiddlewareContext} from "../delta-middleware-context";
const dataVersionHeaderName: string = "data-version";

const dataVersionMiddleware = async (resolve: any, root: any, args: any, context: DeltaMiddlewareContext, info: any) => {
    context.logger ? context.logger.debug('Data version middleware started job', {context}) : {};
    const result = await resolve(root, args, context, info);
    let finalResult;
    if (!root && context.dataVersion && !isNaN(context.dataVersion)) { // assert that it has no root (so it is the root)
        if (result instanceof Array) {
            finalResult = result.filter(entity => entity.dataVersion ? entity.dataVersion > context.dataVersion : entity);
        } else {
            finalResult = result;
        }
    } else {
        finalResult = result;
    }
    context.logger ? context.logger.debug('Data version middleware finished job', {context}) : {};
    return finalResult;
};

const initContextForDataVersion = async ({req}) => {
    return {
        dataVersion: req.headers[dataVersionHeaderName]
    };
};

export {dataVersionMiddleware, initContextForDataVersion};