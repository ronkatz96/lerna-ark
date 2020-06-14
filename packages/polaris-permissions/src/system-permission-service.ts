export interface SystemPermissionService {
    isPermitted(requestingSystemId: string): boolean;
}
