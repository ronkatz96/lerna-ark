import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { Not, In, Connection } from '@enigmatis/polaris-typeorm';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
export class IrrelevantEntitiesMiddleware {
    readonly connection?: Connection;
    readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger, connection?: Connection) {
        this.connection = connection;
        this.logger = logger;
    }

    getMiddleware() {
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
                info.returnType.ofType &&
                this.connection
            ) {
                const irrelevantWhereCriteria: any =
                    Array.isArray(result) && result.length > 0
                        ? { id: Not(In(result.map((x: any) => x.id))) }
                        : {};
                irrelevantWhereCriteria.deleted = In([true, false]);
                const type = info.returnType.ofType.name;
                const resultIrrelevant: any = await this.connection.getRepository(type).find({
                    select: ['id'],
                    where: irrelevantWhereCriteria,
                });
                if (resultIrrelevant) {
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
            }
            this.logger.debug('Irrelevant entities middleware finished job', { context });
            return result;
        };
    }
}
