import { AbstractPolarisLogger } from '@enigmatis/polaris-logs';
import { ConnectionOptions } from 'typeorm';
import { CommonModel, DataVersion, SnapshotPage } from '..';
import { PolarisTypeormLogger } from '../polaris-typeorm-logger';
import { TypeORMConfig } from '../typeorm-config';
import { PolarisConnection } from './polaris-connection';
import { getPolarisConnectionManager } from './polaris-connection-manager';

export async function createPolarisConnection(
    options: ConnectionOptions,
    logger: AbstractPolarisLogger,
    config?: TypeORMConfig,
): Promise<PolarisConnection> {
    options = setPolarisConnectionOptions(options, logger, config);
    return getPolarisConnectionManager()
        .create(options, undefined as any)
        .connect();
}

const setPolarisConnectionOptions = (
    options: ConnectionOptions,
    logger: AbstractPolarisLogger,
    config?: TypeORMConfig,
): ConnectionOptions => {
    Object.assign(options, {
        logger: new PolarisTypeormLogger(logger, options.logging),
    });
    if (config) {
        Object.assign(options, { extra: { ...options.extra, config } });
    }
    const polarisEntities = [CommonModel, DataVersion, SnapshotPage];
    Object.assign(options, {
        entities: options.entities ? [...options.entities, ...polarisEntities] : polarisEntities,
    });
    return options;
};
