export default interface PermissionResult {
    isPermitted: boolean;
    responseHeaders?: { [name: string]: string | string[]; }
    digitalFilters?: { [entity: string]: { [filter: string]: string } }
    portalData?: { [data: string]: any }
}