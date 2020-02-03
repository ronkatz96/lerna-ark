import { RealityMetadata } from './reality-metadata';

export class RealitiesHolder {
    private realitiesMap: Map<number, RealityMetadata>;

    constructor(customRealities?: Map<number, RealityMetadata>) {
        this.realitiesMap = customRealities
            ? new Map([...customRealities])
            : new Map<number, any>();
        this.addReality({ id: 0, name: 'Real', type: 'Main' });
    }

    public addReality(realityMetadata: RealityMetadata) {
        this.realitiesMap.set(realityMetadata.id, realityMetadata);
    }
}
