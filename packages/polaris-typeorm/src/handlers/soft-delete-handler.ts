import { EntityManager, In, UpdateResult } from 'typeorm';
import { CommonModel } from '..';
import { PolarisCriteria } from '../contextable-options/polaris-criteria';

export class SoftDeleteHandler {
    private manager: EntityManager;

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    public async softDeleteRecursive(
        targetOrEntity: any,
        polarisCriteria: PolarisCriteria,
    ): Promise<UpdateResult> {
        const softDeletedEntities = await this.updateWithReturningIds(
            targetOrEntity,
            polarisCriteria.criteria,
            {
                deleted: true,
                lastUpdatedBy:
                    polarisCriteria &&
                    polarisCriteria.context &&
                    polarisCriteria.context.requestHeaders &&
                    (polarisCriteria.context.requestHeaders.upn ||
                        polarisCriteria.context.requestHeaders.requestingSystemName),
            },
        );
        if (softDeletedEntities.affected === 0) {
            return softDeletedEntities;
        }
        const metadata = this.manager.connection.getMetadata(targetOrEntity);
        if (metadata && metadata.relations) {
            for (const relation of metadata.relations) {
                const relationMetadata = relation.inverseEntityMetadata;
                const hasCascadeDeleteFields =
                    relationMetadata.foreignKeys.filter(
                        foreign =>
                            foreign.onDelete === 'CASCADE' &&
                            foreign.referencedEntityMetadata === metadata,
                    ).length > 0;
                const isCommonModel =
                    relationMetadata.inheritanceTree.find(
                        ancestor => ancestor.name === 'CommonModel',
                    ) !== undefined;
                if (isCommonModel && hasCascadeDeleteFields) {
                    const x: { [key: string]: any } = {};
                    x[relation.propertyName] = In(
                        softDeletedEntities.raw.map((row: { id: string }) => row.id),
                    );
                    await this.softDeleteRecursive(
                        relationMetadata.targetName,
                        new PolarisCriteria(x, polarisCriteria.context),
                    );
                }
            }
        }

        return softDeletedEntities;
    }

    private updateWithReturningIds(
        target: any,
        criteria: string | string[] | any,
        partialEntity: any,
    ) {
        // if user passed empty criteria or empty list of criterias, then throw an error
        if (
            criteria === undefined ||
            criteria === null ||
            criteria === '' ||
            (criteria instanceof Array && criteria.length === 0)
        ) {
            return Promise.reject(
                new Error(`Empty criteria(s) are not allowed for the delete method.`),
            );
        }

        if (typeof criteria === 'string' || criteria instanceof Array) {
            return this.manager
                .createQueryBuilder()
                .update(target)
                .set(partialEntity)
                .whereInIds(criteria)
                .returning('id')
                .execute();
        } else {
            return this.manager
                .createQueryBuilder()
                .update(target)
                .set(partialEntity)
                .where(criteria)
                .returning('id')
                .execute();
        }
    }
}
