import {EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent} from "typeorm";
import {CommonModel} from "../models/common-model";
import {DataVersion} from "../models/data-version";

@EventSubscriber()
export class CommonEntitySubscriber implements EntitySubscriberInterface<CommonModel> {
    listenTo(): Function {
        return CommonModel;
    }

    async beforeInsert(event: InsertEvent<CommonModel>) {
        await CommonEntitySubscriber.updateDataVersionInEntity(event);
    }

    async beforeUpdate(event: UpdateEvent<CommonModel>) {
        await CommonEntitySubscriber.updateDataVersionInEntity(event);
    }

    private static async updateDataVersionInEntity(event: InsertEvent<CommonModel> | UpdateEvent<CommonModel>) {
        let polarisContext = event.queryRunner.data.context;
        if (!polarisContext) return;
        let logger = polarisContext.logger;
        logger ? logger.debug('Started data version job when inserting/updating entity') : {};
        let dataVersionRepository = event.connection.getRepository(DataVersion);
        let result = await dataVersionRepository.find();
        if (result.length == 0) {
            logger ? logger.debug('no data version found') : {};
            await dataVersionRepository.save(new DataVersion(1));
            logger ? logger.debug('data version created') : {};
            polarisContext.globalDataVersion = 1;
        } else {
            if (!polarisContext.globalDataVersion) {
                logger ? logger.debug('context does not hold data version') : {};
                let oldDataVersion = result[0].value;
                await dataVersionRepository.increment({}, 'value', 1);
                polarisContext.globalDataVersion = oldDataVersion + 1;
                logger ? logger.debug('data version is incremented and holds new value ' + polarisContext.globalDataVersion) : {};
            }
        }
        event.entity.dataVersion = polarisContext.globalDataVersion;
        logger ? logger.debug('Finished data version job when inserting/updating entity') : {};
    }
}