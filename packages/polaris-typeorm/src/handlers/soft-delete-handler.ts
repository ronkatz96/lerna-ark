import {EntityManager, EntityMetadata} from "typeorm";
import {CommonModel} from "..";

export class SoftDeleteHandler {
    manager: EntityManager;

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    async softDeleteRecursive(targetOrEntity: any, entities: any) {
        let parentEntityMetaData: EntityMetadata | undefined = this.manager.connection.entityMetadatas.find(meta => meta.target == targetOrEntity && meta.inheritanceTree.find(ancestor => ancestor.name == "CommonModel"));
        let childEntityMetaData: EntityMetadata[] = parentEntityMetaData ? parentEntityMetaData.relations.map(relation => relation.inverseEntityMetadata) : [];
        let childEntityMetaDataWithCascade: EntityMetadata[] = childEntityMetaData.filter(child => child.inheritanceTree.find(ancestor => ancestor.name == "CommonModel") && child.foreignKeys.filter(foreign => foreign.onDelete == "CASCADE" && foreign.referencedEntityMetadata == parentEntityMetaData));
        entities = entities instanceof Array ? entities : [entities];
        childEntityMetaDataWithCascade.forEach(child => {
            child.relations.forEach(relation => {
                let childEntities = entities.map((entity: any) => entity[relation.inverseSidePropertyPath])[0];
                childEntities ? this.softDeleteRecursive(child.target, childEntities) : {};
            })
        });
        for (let entity of entities) {
            entity.deleted = true;
        }
        await this.manager.save(targetOrEntity, entities);
    }
}