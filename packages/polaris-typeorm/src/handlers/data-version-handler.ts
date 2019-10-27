import {EntityManager} from "typeorm";
import {DataVersion} from "..";

export class DataVersionHandler {
    manager: EntityManager;
    logger: any;

    constructor(manager: EntityManager) {
        this.manager = manager;
        // @ts-ignore
        this.logger = manager.logger;
    }

    async updateDataVersion<Entity>() {
        let context = this.manager.queryRunner ? this.manager.queryRunner.data ? this.manager.queryRunner.data.context : {} : {};
        this.logger.debug('Started data version job when inserting/updating entity', {context: context});
        let result = await this.manager.findOne(DataVersion);
        if (!result) {
            if (context.globalDataVersion) {
                throw new Error("data version in context even though the data version table is empty");
            }
            this.logger.debug('no data version found', {context: context});
            await this.manager.save(DataVersion, new DataVersion(1));
            this.logger.debug('data version created', {context: context});
            context.globalDataVersion = 1;
        } else {
            if (!context.globalDataVersion) {
                this.logger.debug('context does not hold data version', {context: context});
                await this.manager.increment(DataVersion, {}, 'value', 1);
                let newResult = await this.manager.findOne(DataVersion);
                if (newResult) {
                    context.globalDataVersion = newResult.value;
                } else {
                    throw new Error("global data version was supposed to increment but does not exist");
                }
                this.logger.debug('data version is incremented and holds new value ', {context: context});
            } else {
                if (context.globalDataVersion != result.value)
                    throw new Error("data version in context does not equal data version in table");
            }
        }
        this.logger.debug('Finished data version job when inserting/updating entity', {context: context});
    }

}