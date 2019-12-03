import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { Connection, In, Not } from '@enigmatis/polaris-typeorm';

export class IrrelevantEntitiesMiddleware {
    public readonly connection?: Connection;
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger, connection?: Connection) {
        this.connection = connection;
        this.logger = logger;
    }

    private getTypeName(info: any) : string {
        let type = info.returnType;
        while (!type.name) {
            type = type.ofType;
        }
        const typeName = type.name;
        return typeName;
    }

    public getMiddleware() {
        return async (
            resolve: any,
            root: any,
            args: { [argName: string]: any },
            context: PolarisGraphQLContext,
            info: any,
        ) => {
            this.logger.debug('Irrelevant entities middleware started job', { context });
            const result = await resolve(root, args, context, info);
            if (
                context &&
                context.requestHeaders &&
                context.requestHeaders.dataVersion !== undefined &&
                !isNaN(context.requestHeaders.dataVersion) &&
                info.returnType.ofType &&
                this.connection &&
                !root
            ) {
                const irrelevantWhereCriteria = this.createIrrelevantWhereCriteria(result, context);
                const typeName = this.getTypeName(info);
                const resultIrrelevant: any = await this.connection.getRepository(typeName).find({
                    select: ['id'],
                    where: irrelevantWhereCriteria,
                });
                if (resultIrrelevant && resultIrrelevant.length > 0) {
                    this.appendIrrelevantEntitiesToExtensions(info, resultIrrelevant, context);
                }
            }
            this.logger.debug('Irrelevant entities middleware finished job', { context });
            return result;
        };
    }

    private appendIrrelevantEntitiesToExtensions(info: any, resultIrrelevant: any, context: PolarisGraphQLContext) {
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

    private createIrrelevantWhereCriteria(result: any, context: PolarisGraphQLContext) {
        const irrelevantWhereCriteria: any =
            Array.isArray(result) && result.length > 0
                ? {id: Not(In(result.map((x: any) => x.id)))}
                : {};
        irrelevantWhereCriteria.deleted = In([true, false]);
        irrelevantWhereCriteria.realityId = context.requestHeaders.realityId;
        return irrelevantWhereCriteria;
    }
}
