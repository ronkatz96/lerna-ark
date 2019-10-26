import {DataVersion} from "../models/data-version";
import {PolarisEntityManager} from "../polaris-entity-manager";

export class DataVersionHandler {
    polarisEntityManager: PolarisEntityManager;
    logger: any;

    constructor(manager: PolarisEntityManager) {
        this.polarisEntityManager = manager;
        this.logger = manager.logger;
    }

    async updateDataVersion<Entity>() {
        let polarisContext = this.polarisEntityManager.queryRunner.data.context;
        this.logger.debug('Started data version job when inserting/updating entity', {context: polarisContext});
        let result = await this.polarisEntityManager.findOne(DataVersion);
        if (!result) {
            if (polarisContext.globalDataVersion) {
                throw new Error("data version in context even though the data version table is empty");
            }
            this.logger.debug('no data version found', {context: polarisContext});
            await this.polarisEntityManager.save(DataVersion, new DataVersion(1));
            this.logger.debug('data version created', {context: polarisContext});
            polarisContext.globalDataVersion = 1;
        } else {
            if (!polarisContext.globalDataVersion) {
                this.logger.debug('context does not hold data version', {context: polarisContext});
                await this.polarisEntityManager.increment(DataVersion, {}, 'value', 1);
                polarisContext.globalDataVersion = (await this.polarisEntityManager.findOne(DataVersion, {})).value;
                this.logger.debug('data version is incremented and holds new value ', {context: polarisContext});
            } else {
                if (polarisContext.globalDataVersion != result.value)
                    throw new Error("data version in context does not equal data version in table");
            }
        }
        this.logger.debug('Finished data version job when inserting/updating entity', {context: polarisContext});
    }

}