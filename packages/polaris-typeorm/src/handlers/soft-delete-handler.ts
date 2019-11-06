import { EntityManager, EntityMetadata } from 'typeorm';
import { CommonModel } from '..';

export class SoftDeleteHandler {
    private manager: EntityManager;

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    public async softDeleteRecursive(targetOrEntity: any, entities: any): Promise<void> {
        const parentEntityMetaData:
            | EntityMetadata
            | undefined = this.manager.connection.entityMetadatas.find(
            meta =>
                meta.target === targetOrEntity &&
                meta.inheritanceTree.find(ancestor => ancestor.name === 'CommonModel'),
        );
        const childEntityMetaData: EntityMetadata[] = parentEntityMetaData
            ? parentEntityMetaData.relations.map(relation => relation.inverseEntityMetadata)
            : [];
        const childEntityMetaDataWithCascade: EntityMetadata[] = childEntityMetaData.filter(
            child =>
                child.inheritanceTree.find(ancestor => ancestor.name === 'CommonModel') &&
                child.foreignKeys.filter(
                    foreign =>
                        foreign.onDelete === 'CASCADE' &&
                        foreign.referencedEntityMetadata === parentEntityMetaData,
                ),
        );
        entities = entities instanceof Array ? entities : [entities];
        for (const child of childEntityMetaDataWithCascade) {
            for (const relation of child.relations) {
                const childEntities = entities.map(
                    (entity: any) => entity[relation.inverseSidePropertyPath],
                )[0];
                if (childEntities) {
                    await this.softDeleteRecursive(child.target, childEntities);
                }
            }
        }
        for (const entity of entities) {
            entity.deleted = true;
        }
        await this.manager.save(targetOrEntity, entities);
    }
}
