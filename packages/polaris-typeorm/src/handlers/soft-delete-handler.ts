import { EntityManager, In, ObjectID } from 'typeorm';
import { CommonModel } from '..';

export class SoftDeleteHandler {
    private manager: EntityManager;

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    public async softDeleteRecursive(
        targetOrEntity: any,
        criteria:
            | string
            | string[]
            | number
            | number[]
            | Date
            | Date[]
            | ObjectID
            | ObjectID[]
            | any,
    ): Promise<void> {
        const softDeletedEntities = await this.updateWithReturningIds(targetOrEntity, criteria, {
            deleted: true,
        });
        if (softDeletedEntities.affected === 0) {
            return;
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
                    await this.softDeleteRecursive(relationMetadata.targetName, x);
                }
            }
        }
    }

    private updateWithReturningIds(
        target: any,
        criteria:
            | string
            | string[]
            | number
            | number[]
            | Date
            | Date[]
            | ObjectID
            | ObjectID[]
            | any,
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
                new Error(`Empty criteria(s) are not allowed for the update method.`),
            );
        }

        if (
            typeof criteria === 'string' ||
            typeof criteria === 'number' ||
            criteria instanceof Date ||
            criteria instanceof Array
        ) {
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
