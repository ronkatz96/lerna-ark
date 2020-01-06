import { runAndMeasureTime } from '@enigmatis/polaris-common';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
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
                const now = new Date();
                event.entity.setCreationTime(now);
                event.entity.setLastUpdateTime(now);
            });
            event.connection.logger.log('log', 'prePersist finished');
        }
    }

    public async beforeUpdate(event: UpdateEvent<CommonModel>) {
        if (event.entity) {
            event.connection.logger.log('log', 'preUpdate began');
            await runAndMeasureTime(async () => {
                const now = new Date();
                event.entity.setLastUpdateTime(now);
            });
            event.connection.logger.log('log', 'preUpdate finished');
        }
    }
}
