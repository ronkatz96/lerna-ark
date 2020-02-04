import { Reality } from './reality';

export class RealitiesHolder {
    private realitiesMap: Map<number, Reality>;

    constructor(customRealities?: Map<number, Reality>) {
        this.realitiesMap = customRealities
            ? new Map([...customRealities])
            : new Map<number, any>();
        this.addReality({ id: 0, name: 'Real', type: 'Real' });
    }

    public addReality(realityMetadata: Reality): void {
        this.realitiesMap.set(realityMetadata.id, realityMetadata);
    }

    public getReality(realityId: number): Reality | undefined {
        return this.realitiesMap.get(realityId);
    }
}
