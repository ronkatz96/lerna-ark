import { RealityMetadata } from './reality-metadata';

export class RealitiesHolder {
    private realitiesMap: Map<number, RealityMetadata>;

    constructor(customRealities?: Map<number, RealityMetadata>) {
        this.realitiesMap = customRealities
            ? new Map([...customRealities])
            : new Map<number, any>();
        this.addReality({ id: 0, name: 'Real', type: 'Oper' });
    }

    public addReality(realityMetadata: RealityMetadata): void {
        this.realitiesMap.set(realityMetadata.id, realityMetadata);
    }

    public getReality(realityId: number): RealityMetadata | undefined {
        return this.realitiesMap.get(realityId);
    }
}
