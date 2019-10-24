import { PolarisEntityManager} from "../polaris-entity-manager";

// todo: if the field is common modal or list of common model and cascade all or cascade remove is on soft delete it too and field is not syntethic tru update
export const softDeleteRecursive = async (targetOrEntity: any, entities: any, entityManager: PolarisEntityManager) => {
    for (let entity of entities) {
        entity.deleted = true;
    }
    await entityManager.save(targetOrEntity, entities);
};