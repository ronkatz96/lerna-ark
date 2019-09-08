import {IMiddleware} from "graphql-middleware";

const dataVersionHeaderName: string = "data-version";

const dataVersionMiddleware: IMiddleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
    const result = await resolve(root, args, context, info);
    if (!root) { // assert that its a root resolver
        if (result instanceof Array) {
            return result.filter(entity => entity.dataVersion ? entity.dataVersion > context.dataVersion : entity);
        } else {
            return result;
        }
    } else {
        return result;
    }
};

const initContextForDataVersion = async ({req}) => {
    return {
        dataVersion: req.headers[dataVersionHeaderName]
    };
};

export {dataVersionMiddleware, initContextForDataVersion};