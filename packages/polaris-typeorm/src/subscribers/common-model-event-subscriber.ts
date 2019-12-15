import {
    PolarisExtensions,
    PolarisRequestHeaders,
    runAndMeasureTime,
} from '@enigmatis/polaris-common';
import {
    EntityManager,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
} from 'typeorm';
import { CommonModel } from '..';

@EventSubscriber()
export class CommonModelEventSubscriber implements EntitySubscriberInterface<CommonModel> {
    public listenTo() {
        return CommonModel;
    }

    public async beforeInsert(event: InsertEvent<CommonModel>) {
        if (event.entity) {
            event.connection.logger.log('log', 'prePersist began', event.queryRunner);
            await runAndMeasureTime(async () => {
                this.setEntityRealityId(event.manager, event.entity);
                const now = new Date();
                event.entity.setCreationTime(now);
                event.entity.setLastUpdateTime(now);
                const createdBySource = this.getUpnOrRequestingSystemIdFromHeader(event.manager);
                event.entity.setCreatedBy(createdBySource);
                event.entity.setLastUpdatedBy(createdBySource);
            });
            event.connection.logger.log('log', 'prePersist finished');
        }
    }

    public async beforeUpdate(event: UpdateEvent<CommonModel>) {
        if (event.entity) {
            event.connection.logger.log('log', 'preUpdate began');
            await runAndMeasureTime(async () => {
                this.setEntityRealityId(event.manager, event.entity);
                const now = new Date();
                event.entity.setLastUpdateTime(now);
                event.entity.setLastUpdatedBy(
                    this.getUpnOrRequestingSystemIdFromHeader(event.manager),
                );
            });
            event.connection.logger.log('log', 'preUpdate finished');
        }
    }

    private setEntityRealityId(manager: EntityManager, entity: CommonModel) {
        const realityIdFromHeader = this.getHeaders(manager).realityId || 0;
        if (entity.getRealityId() === undefined) {
            entity.setRealityId(realityIdFromHeader);
        } else if (entity.getRealityId() !== realityIdFromHeader) {
            throw new Error('reality id of entity is different from header');
        }
    }

    private getUpnOrRequestingSystemIdFromHeader(manager: EntityManager): string | undefined {
        const headers: PolarisRequestHeaders =
            manager.queryRunner &&
            manager.queryRunner.data &&
            (manager.queryRunner.data.requestHeaders || {});
        return headers.upn || headers.requestingSystemId;
    }

    private getHeaders = (manager: EntityManager): PolarisRequestHeaders =>
        manager.queryRunner &&
        manager.queryRunner.data &&
        (manager.queryRunner.data.requestHeaders || {});

    private getExtensions = (manager: EntityManager): PolarisExtensions =>
        manager.queryRunner &&
        manager.queryRunner.data &&
        (manager.queryRunner.data.returnedExtensions || {});
}
