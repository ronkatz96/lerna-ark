import { RealitiesHolder } from '@enigmatis/polaris-common';
import { getPolarisConnectionManager, PolarisConnection } from '..';

export const getConnectionForReality = (
    realityId: number,
    realitiesHolder: RealitiesHolder,
): PolarisConnection => {
    const connectionManager = getPolarisConnectionManager();
    const reality = realitiesHolder.getReality(realityId);
    const realityName = reality?.name;
    if (realityName == null) {
        throw new Error(`Reality id: ${realityId} has no name for connection`);
    }
    if (!connectionManager.has(realityName)) {
        throw new Error(`There is no connections: '${realityName}' for reality id: ${realityId}`);
    }

    return connectionManager.get(realityName);
};
