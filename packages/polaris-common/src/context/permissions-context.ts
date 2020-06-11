import { PermissionsCache } from '../permissions/permissions-cache';

export interface PermissionsContext {
    permissionsCacheHolder: PermissionsCache;
    digitalFilters: { [entity: string]: { [action: string]: any } };
    portalData: any;
}
