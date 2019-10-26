import {TypeORMConfig, PolarisContext} from "../common-polaris";
import {EntityManager, MoreThan} from "typeorm";


const softDeleteCriteria = (config?: TypeORMConfig) =>
    config && config.softDelete && config.softDelete.returnEntities ? undefined : false;

const dataVersionCriteria = (context: PolarisContext) =>
    context && context.dataVersion != undefined ? MoreThan(context.dataVersion) : undefined;

const realityIdCriteria = (includeLinkedOper: boolean, context: PolarisContext) => {
    if (includeLinkedOper) {
        return context && context.realityId ? context.includeLinkedOper ? [context.realityId, 0] : context.realityId : 0;
    }
    return context && context.realityId ? context.realityId : 0;
};

export class FindHandler {
    manager: EntityManager;

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    findConditions(includeLinkedOper: boolean, optionsOrConditions?: any) {
        let context = this.manager.queryRunner ? this.manager.queryRunner.data ? this.manager.queryRunner.data.context : {} : {};
        let polarisCriteria = optionsOrConditions ? optionsOrConditions : {};
        polarisCriteria.where = optionsOrConditions && optionsOrConditions.where ? optionsOrConditions.where : {};
        let dvCriteria = dataVersionCriteria(context);
        // @ts-ignore
        let sdCriteria = softDeleteCriteria(this.manager.config);
        polarisCriteria.where.realityId = realityIdCriteria(includeLinkedOper, context);
        dvCriteria === undefined ? delete polarisCriteria.where.dataVersion : polarisCriteria.where.dataVersion = dvCriteria;
        sdCriteria === undefined ? delete polarisCriteria.where.deleted : polarisCriteria.where.deleted = sdCriteria;
        return polarisCriteria;
    }
}