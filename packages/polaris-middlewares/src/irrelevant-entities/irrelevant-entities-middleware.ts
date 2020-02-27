import { PolarisGraphQLContext, RealitiesHolder } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    getPolarisConnectionManager,
    In,
    Not,
    PolarisConnection,
} from '@enigmatis/polaris-typeorm';
import { getConnectionForReality } from '../utills/connection-retriever';

export class IrrelevantEntitiesMiddleware {
    private static getTypeName(info: any): string {
        let type = info.returnType;
        while (!type.name) {
            type = type.ofType;
        }
        return type.name;
    }

    private static appendIrrelevantEntitiesToExtensions(
        info: any,
        resultIrrelevant: any,
        context: PolarisGraphQLContext,
    ) {
        const irrelevantEntities: any = {};
        irrelevantEntities[info.path.key] = resultIrrelevant.map((x: any) => x.id);
        if (!context.returnedExtensions) {
            context.returnedExtensions = {} as any;
        }
        context.returnedExtensions = {
            ...context.returnedExtensions,
            irrelevantEntities: {
                ...context.returnedExtensions.irrelevantEntities,
                ...irrelevantEntities,
            },
        } as any;
    }

    private static createIrrelevantWhereCriteria(result: any, context: PolarisGraphQLContext) {
        const irrelevantWhereCriteria: any =
            Array.isArray(result) && result.length > 0
                ? { id: Not(In(result.map((x: any) => x.id))) }
                : {};
        irrelevantWhereCriteria.deleted = In([true, false]);
        irrelevantWhereCriteria.realityId = context.requestHeaders.realityId;
        return irrelevantWhereCriteria;
    }

    public readonly connection?: PolarisConnection;
    public readonly realitiesHolder: RealitiesHolder;
    public readonly logger: PolarisGraphQLLogger;

    constructor(
        logger: PolarisGraphQLLogger,
        realitiesHolder: RealitiesHolder,
        connection?: PolarisConnection,
    ) {
        this.connection = connection;
        this.logger = logger;
        this.realitiesHolder = realitiesHolder;
    }

    public getMiddleware() {
        return async (
            resolve: any,
            root: any,
            args: { [argName: string]: any },
            context: PolarisGraphQLContext,
            info: any,
        ) => {
            this.logger.debug('Irrelevant entities middleware started job', context);
            const result = await resolve(root, args, context, info);

            if (
                context?.requestHeaders?.dataVersion != null &&
                context?.requestHeaders?.realityId != null &&
                !isNaN(context?.requestHeaders?.dataVersion) &&
                info.returnType.ofType &&
                getPolarisConnectionManager().connections.length > 0 &&
                !root
            ) {
                const connection = getConnectionForReality(
                    context.requestHeaders.realityId,
                    this.realitiesHolder,
                );
                const irrelevantWhereCriteria = IrrelevantEntitiesMiddleware.createIrrelevantWhereCriteria(
                    result,
                    context,
                );
                const typeName = IrrelevantEntitiesMiddleware.getTypeName(info);
                const resultIrrelevant: any = await connection
                    .getRepository(typeName)
                    .find(context, {
                        select: ['id'],
                        where: irrelevantWhereCriteria,
                    });
                if (resultIrrelevant && resultIrrelevant.length > 0) {
                    IrrelevantEntitiesMiddleware.appendIrrelevantEntitiesToExtensions(
                        info,
                        resultIrrelevant,
                        context,
                    );
                }
            }

            this.logger.debug('Irrelevant entities middleware finished job', context);
            return result;
        };
    }
}
