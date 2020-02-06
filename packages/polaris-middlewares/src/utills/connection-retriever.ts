import { PolarisError, RealitiesHolder } from '@enigmatis/polaris-common';
import { Connection, getConnectionManager } from '@enigmatis/polaris-typeorm';

export function getConnectionForReality(realityId: number, realitiesHolder: RealitiesHolder): Connection {
    const connectionManager = getConnectionManager();
    const reality = realitiesHolder.getReality(realityId);
    const realityName = reality?.name;
    if (realityName == null) {
        throw new PolarisError(`Reality id: ${realityId} has no name for connection`, 500);
    }
    if (!connectionManager.has(realityName)) {
        throw new PolarisError(`There is no connections: '${realityName}' for reality id: ${realityId}`, 500);
    }

    return connectionManager.get(realityName);
}