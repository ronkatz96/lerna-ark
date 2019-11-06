import { PolarisBaseContext } from '@enigmatis/polaris-common';
import { Connection, EntityManager, MoreThan } from 'typeorm';

const softDeleteCriteria = (connection: Connection) => {
    const config = connection.options.extra.config;
    return config && config.softDelete && config.softDelete.returnEntities ? undefined : false;
};

const dataVersionCriteria = (context: PolarisBaseContext) =>
    context.dataVersion !== undefined ? MoreThan(context.dataVersion) : undefined;

const realityIdCriteria = (includeLinkedOper: boolean, context: PolarisBaseContext) =>
    includeLinkedOper && context.realityId !== 0 && context.includeLinkedOper
        ? [context.realityId, 0]
        : context.realityId || 0;

export class FindHandler {
    private manager: EntityManager;

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    public findConditions(includeLinkedOper: boolean, optionsOrConditions?: any) {
        let context: PolarisBaseContext = {};
        if (this.manager.queryRunner && this.manager.queryRunner.data) {
            context = this.manager.queryRunner.data.context || context;
        }
        const polarisCriteria = optionsOrConditions || {};
        const riCriteria = realityIdCriteria(includeLinkedOper, context);
        const dvCriteria = dataVersionCriteria(context);
        const sdCriteria = softDeleteCriteria(this.manager.connection);
        if (!polarisCriteria.where) {
            polarisCriteria.where = {};
        }
        polarisCriteria.where.realityId = riCriteria;
        dvCriteria === undefined
            ? delete polarisCriteria.where.dataVersion
            : (polarisCriteria.where.dataVersion = dvCriteria);
        sdCriteria === undefined
            ? delete polarisCriteria.where.deleted
            : (polarisCriteria.where.deleted = sdCriteria);
        return polarisCriteria;
    }
}
