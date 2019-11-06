import { PolarisLogger } from '@enigmatis/polaris-logs';
import { ConnectionOptions, createConnection } from 'typeorm';
import { TypeORMConfig } from '../common-polaris';
import { PolarisEntityManager } from '../polaris-entity-manager';
import { PolarisTypeormLogger } from '../polaris-typeorm-logger';

export async function createPolarisConnection(
    options: ConnectionOptions,
    logger: PolarisLogger,
    config?: TypeORMConfig,
) {
    Object.assign(options, { logger: new PolarisTypeormLogger(logger, options.logging) });
    const configObj = { config: config || {} };
    options.extra
        ? Object.assign(options.extra, configObj)
        : Object.assign(options, { extra: configObj });
    const connection = await createConnection(options);
    Object.defineProperty(connection, 'manager', { value: new PolarisEntityManager(connection) });
    return connection;
}
