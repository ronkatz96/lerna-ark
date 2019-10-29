import {PolarisBaseContext} from "@enigmatis/polaris-common"

const realitiesMiddleware = async (resolve: any, root: any, args: any, context: PolarisBaseContext, info: any) => {
    const result = await resolve(root, args, context, info);
    const operationalRealityId: number = 0;
    context.realityId = context.realityId ? context.realityId : 0;
    const noRealityIdOrSameAsHeader = (entity: any) => entity.realityId == undefined || entity.realityId == context.realityId;
    if (!root) { // assert that its a root resolver
        if (result instanceof Array) {
            return result.filter(noRealityIdOrSameAsHeader);
        } else {
            if (noRealityIdOrSameAsHeader(result))
                return result;
        }
    } else {
        if (noRealityIdOrSameAsHeader(result) || (context.includeLinkedOper && result.realityId == operationalRealityId))
            return result;
    }
    return null;
};

export {realitiesMiddleware};
