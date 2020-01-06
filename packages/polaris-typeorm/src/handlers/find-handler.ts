import { PolarisRequestHeaders } from '@enigmatis/polaris-common';
import { In, MoreThan } from 'typeorm';
import { PolarisFindOneOptions } from '..';
import { PolarisFindManyOptions } from '../contextable-options/polaris-find-many-options';

export const getAllEntitiesIncludingDeleted = { where: { deleted: In([true, false]) } };

const realityIdCriteria = (includeLinkedOper: boolean, headers: PolarisRequestHeaders) =>
    includeLinkedOper && headers.realityId !== 0 && headers.includeLinkedOper
        ? In([headers.realityId, 0])
        : headers.realityId || 0;

export class FindHandler {
    public findConditions<Entity>(
        includeLinkedOper: boolean,
        polarisOptions?: PolarisFindManyOptions<Entity> | PolarisFindOneOptions<Entity>,
    ) {
        const headers: PolarisRequestHeaders =
            (polarisOptions && polarisOptions.context && polarisOptions.context.requestHeaders) ||
            {};

        let polarisCriteria: any = {};
        if (polarisOptions && typeof polarisOptions.criteria === 'string') {
            polarisCriteria = { where: { id: polarisOptions.criteria } };
        } else if (polarisOptions && polarisCriteria instanceof Array) {
            polarisCriteria = { where: { id: In(polarisOptions.criteria) } };
        } else {
            polarisCriteria = (polarisOptions && polarisOptions.criteria) || {};
        }

        polarisCriteria.where = { ...polarisCriteria.where };
        if (polarisCriteria.where.deleted === undefined) {
            polarisCriteria.where.deleted = false;
        }
        if (polarisCriteria.where.dataVersion === undefined && headers.dataVersion) {
            polarisCriteria.where.dataVersion = MoreThan(headers.dataVersion);
        }
        if (polarisCriteria.where.realityId === undefined) {
            polarisCriteria.where.realityId = realityIdCriteria(includeLinkedOper, headers);
        }
        return polarisCriteria;
    }
}
