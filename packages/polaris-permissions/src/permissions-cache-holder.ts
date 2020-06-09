export default class PermissionsCacheHolder {
    private readonly cachedPermittedTypesActions: { [type: string]: string[] };
    private readonly cachedTypesActionDigitalFilters: { [entity: string]: { [action: string]: any } };
    private readonly cachedTypesHeaders: { [type: string]: any };
    private readonly portalData:  { [data: string]: any };

    constructor() {
        this.cachedPermittedTypesActions = {};
        this.cachedTypesActionDigitalFilters = {};
        this.cachedTypesHeaders = {};
        this.portalData = {};
    }

    public addPermissions(type: string, permittedActions: string[]): void{
        if(this.cachedPermittedTypesActions){
            this.cachedPermittedTypesActions[type] = permittedActions;
        }
    }

    public addDigitalFilters(type: string, digitalFilters: { [action: string]: any } ){
        if(this.cachedTypesActionDigitalFilters){
            this.cachedTypesActionDigitalFilters[type] = digitalFilters
        }
    }

    public addCachedHeaders(type: string, headers: any){
        if(this.cachedTypesHeaders){
            this.cachedTypesHeaders[type] = headers;
        }
    }

    public addPortalData(type:string, portalData: any){
        if(this.portalData) {
            this.portalData[type] = portalData;
        }
    }

    public isCached(type: string): boolean {
        return type in this.cachedPermittedTypesActions;
    }

    public getPermittedActions(entityType: string) {
        return this.cachedPermittedTypesActions[entityType];
    }

    public getDigitalFilters(entityTypes: string[]) : { [entity: string]: { [action: string]: any } }{
        const digitalFilters :{ [entity: string]: { [action: string]: any } } = {}

        for(let entityType of entityTypes){
            digitalFilters[entityType] = this.cachedTypesActionDigitalFilters[entityType];
        }

        return digitalFilters;
    }

    public getCachedHeaders(entityType: string){
        return this.cachedTypesHeaders[entityType];
    }

    public getPortalData(entityTypes: string[]){
        const portalData : { [data: string]: any } = {};

        for(const entityType of entityTypes){
            portalData[entityType] = this.portalData[entityType];
        }

        return portalData;
    }

}
