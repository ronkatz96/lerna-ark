export default class PermissionsCacheHolder {

    constructor(
        private cachedPermittedTypesActions: { [type: string]: string[] },
        private cachedTypesActionDigitalFilters: { [type: string]: string[] }
    ) {
    }

    public addPermissions(type: string, permittedActions: string[]): void{
        if(this.cachedPermittedTypesActions){
            this.cachedPermittedTypesActions[type] = permittedActions;
        }
    }

    public isCached(type: string): boolean {
        return type in this.cachedPermittedTypesActions;
    }

}