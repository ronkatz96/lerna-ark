export default class PermissionsCacheHolder {

    constructor(
        private cachedPermittedTypesActions: { [type: string]: string[] },
        private cachedTypesActionDigitalFilters: { [type: string]: any }
    ) {
    }

    public addPermissions(type: string, permittedActions: string[]): void{
        if(this.cachedPermittedTypesActions){
            this.cachedPermittedTypesActions[type] = permittedActions;
        }
    }

    public addDigitalFilters(type: string, digitalFilters: any){
        if(this.cachedTypesActionDigitalFilters){
            this.cachedTypesActionDigitalFilters[type] = digitalFilters
        }
    }

    public isCached(type: string): boolean {
        return type in this.cachedPermittedTypesActions;
    }

    public getPermittedActions(entityType: string) {
        return this.cachedPermittedTypesActions[entityType];
    }
}
