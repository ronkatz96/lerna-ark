import { PolarisBaseContext } from '@enigmatis/polaris-common';
import { EntityManager } from 'typeorm';
import { DataVersion } from '..';

export class DataVersionHandler {
    private manager: EntityManager;

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    public async updateDataVersion<Entity>() {
        let context: PolarisBaseContext = {};
        if (this.manager.queryRunner && this.manager.queryRunner.data) {
            context = this.manager.queryRunner.data.context || context;
        }
        this.manager.connection.logger.log(
            'log',
            'Started data version job when inserting/updating entity',
        );
        const result = await this.manager.findOne(DataVersion);
        if (!result) {
            if (context.globalDataVersion) {
                throw new Error(
                    'data version in context even though the data version table is empty',
                );
            }
            this.manager.connection.logger.log('log', 'no data version found');
            await this.manager.save(DataVersion, new DataVersion(1));
            this.manager.connection.logger.log('log', 'data version created');
            context.globalDataVersion = 1;
        } else {
            if (!context.globalDataVersion) {
                this.manager.connection.logger.log('log', 'context does not hold data version');
                await this.manager.increment(DataVersion, {}, 'value', 1);
                const newResult = await this.manager.findOne(DataVersion);
                if (newResult) {
                    context.globalDataVersion = newResult.getValue();
                } else {
                    throw new Error(
                        'global data version was supposed to increment but does not exist',
                    );
                }
                this.manager.connection.logger.log(
                    'log',
                    'data version is incremented and holds new value ',
                );
            } else {
                if (context.globalDataVersion !== result.getValue()) {
                    throw new Error('data version in context does not equal data version in table');
                }
            }
        }
        this.manager.connection.logger.log(
            'log',
            'Finished data version job when inserting/updating entity',
        );
    }
}
