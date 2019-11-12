import { PolarisRequestHeaders } from '@enigmatis/polaris-common';
import { Connection, EntityManager, MoreThan } from 'typeorm';

const softDeleteCriteria = (connection: Connection) => {
    const config = connection.options.extra.config;
    return config && config.softDelete && config.softDelete.returnEntities ? undefined : false;
};
const dataVersionCriteria = (headers: PolarisRequestHeaders) =>
    headers.dataVersion !== undefined ? MoreThan(headers.dataVersion) : undefined;

const realityIdCriteria = (includeLinkedOper: boolean, headers: PolarisRequestHeaders) =>
    includeLinkedOper && headers.realityId !== 0 && headers.includeLinkedOper
        ? [headers.realityId, 0]
        : headers.realityId || 0;

export class FindHandler {
    private manager: EntityManager;

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    public findConditions(includeLinkedOper: boolean, optionsOrConditions?: any) {
        const headers: PolarisRequestHeaders =
            this.manager.queryRunner &&
            this.manager.queryRunner.data &&
            (this.manager.queryRunner.data.requestHeaders || {});
        const polarisCriteria = optionsOrConditions || {};
        const riCriteria = realityIdCriteria(includeLinkedOper, headers);
        const dvCriteria = dataVersionCriteria(headers);
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
