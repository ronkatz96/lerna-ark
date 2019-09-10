import {EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent} from "typeorm";
import {CommonModel} from "../models/common-model";
import {DataVersion} from "../models/data-version";

@EventSubscriber()
export class CommonEntitySubscriber implements EntitySubscriberInterface<CommonModel> {
    listenTo(): Function {
        return CommonModel;
    }

    async beforeInsert(event: InsertEvent<CommonModel>) {
        let polarisContext = event.queryRunner.data.context;
        if (!polarisContext) return;
        let dataVersionRepository = event.connection.getRepository(DataVersion);
        let result = await dataVersionRepository.find();
        if (result.length == 0) {
            console.log('no data version found');
            await dataVersionRepository.save(new DataVersion(1));
            console.log('data version created');
            polarisContext.globalDataVersion = 1;
        } else {
            if (!polarisContext.globalDataVersion) {
                console.log('context does not hold data version');
                let oldDataVersion = result[0].value;
                await dataVersionRepository.increment({}, 'value', 1);
                polarisContext.globalDataVersion = oldDataVersion + 1;
                console.log('data version is incremented and holds new value ' + polarisContext.globalDataVersion);
            }
        }
        event.entity.dataVersion = polarisContext.globalDataVersion;
        console.log(event.entity);
    }
}