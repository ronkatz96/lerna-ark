import {EntitySubscriberInterface, EventSubscriber, InsertEvent} from "typeorm";
import {CommonModel} from "../models/common-model";

@EventSubscriber()
export class CommonEntitySubscriber implements EntitySubscriberInterface<CommonModel>{
    listenTo(): Function {
        return CommonModel;
    }

    beforeInsert(event: InsertEvent<CommonModel>): Promise<any> | void {
        let polarisContext = event.queryRunner.data.context;
        console.log((polarisContext));
    }
}