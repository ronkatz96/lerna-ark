import {PolarisContext} from "../common-polaris";
import {Connection, EntityManager, MoreThan} from "typeorm";


const softDeleteCriteria = (connection: Connection) => {
    let config = connection.options.extra.config;
    return config && config.softDelete && config.softDelete.returnEntities ? undefined : false;
};

const dataVersionCriteria = (context: PolarisContext) =>
    context.dataVersion != undefined ? MoreThan(context.dataVersion) : undefined;

const realityIdCriteria = (includeLinkedOper: boolean, context: PolarisContext) =>
    includeLinkedOper && context.realityId != 0 && context.includeLinkedOper ? [context.realityId, 0] : context.realityId || 0;


export class FindHandler {
    manager: EntityManager;

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    findConditions(includeLinkedOper: boolean, optionsOrConditions?: any) {
        let context = this.manager.queryRunner ? this.manager.queryRunner.data.context : {};
        let polarisCriteria = optionsOrConditions || {};
        let dvCriteria = dataVersionCriteria(context);
        let sdCriteria = softDeleteCriteria(this.manager.connection);
        polarisCriteria.where.realityId = realityIdCriteria(includeLinkedOper, context);
        dvCriteria === undefined || (polarisCriteria.where.dataVersion = dvCriteria);
        sdCriteria === undefined || (polarisCriteria.where.deleted = sdCriteria);
        return polarisCriteria;
    }
}