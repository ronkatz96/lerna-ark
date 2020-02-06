import { Reality } from './reality';

export class RealitiesHolder {
    private realitiesMap: Map<number, Reality>;

    constructor(customRealities?: Map<number, Reality>) {
        this.realitiesMap = customRealities
            ? new Map([...customRealities])
            : new Map<number, any>();
        this.addReality({ id: 0, name: 'Real', type: 'Real' });
    }

    public addReality(reality: Reality): void {
        if (this.hasReality(reality.id)) {
            throw new Error(`Reality id: ${reality.id} already exists in realities holder`);
        }
        this.updateReality(reality);
    }

    public updateReality(reality: Reality) {
        this.realitiesMap.set(reality.id, reality);
    }

    public getReality(realityId: number): Reality | undefined {
        return this.realitiesMap.get(realityId);
    }

    public hasReality(realityId: number): boolean {
        return this.realitiesMap.has(realityId);
    }
}
