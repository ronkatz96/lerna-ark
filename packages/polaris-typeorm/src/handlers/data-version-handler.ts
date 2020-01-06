import { PolarisExtensions, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { EntityManager } from 'typeorm';
import { DataVersion } from '..';

export class DataVersionHandler {
    private manager: EntityManager;

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    public async updateDataVersion<Entity>(context: PolarisGraphQLContext) {
        const extensions: PolarisExtensions = (context && context.returnedExtensions) || {};
        this.manager.connection.logger.log(
            'log',
            'Started data version job when inserting/updating entity',
        );
        const result: DataVersion | undefined = await this.manager.findOne(DataVersion);
        if (!result) {
            if (extensions.globalDataVersion) {
                throw new Error(
                    'data version in context even though the data version table is empty',
                );
            }
            this.manager.connection.logger.log('log', 'no data version found');
            await this.manager.save(DataVersion, new DataVersion(1));
            this.manager.connection.logger.log('log', 'data version created');
            extensions.globalDataVersion = 1;
        } else {
            if (!extensions.globalDataVersion) {
                this.manager.connection.logger.log('log', 'context does not hold data version');
                await this.manager.increment(DataVersion, {}, 'value', 1);
                const newResult = await this.manager.findOne(DataVersion);
                if (newResult) {
                    extensions.globalDataVersion = newResult.getValue();
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
                if (extensions.globalDataVersion !== result.getValue()) {
                    throw new Error('data version in context does not equal data version in table');
                }
            }
        }
        if (context && extensions) {
            context.returnedExtensions = extensions;
        }
        this.manager.connection.logger.log(
            'log',
            'Finished data version job when inserting/updating entity',
        );
    }
}
