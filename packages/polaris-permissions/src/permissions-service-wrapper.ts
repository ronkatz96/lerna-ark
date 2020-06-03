import {PolarisLogger} from "@enigmatis/polaris-logs";
import PermissionResult from "./permission-result";
import axios, {AxiosPromise} from 'axios';
import PermissionsCacheHolder from "./permissions-cache-holder";

export default class PermissionsServiceWrapper {
    constructor(private readonly serviceUrl: string,
                private readonly requestFormat: string,
                private readonly logger: PolarisLogger,
                private readonly permissionsCacheHolder: PermissionsCacheHolder,
    ) {
    }

    public async getPermissionResult(upn: string, reality: string, entityTypes: string[], actions: string[], permissionHeaders: { [name: string]: string | string[] }): Promise<PermissionResult> {
        if (!this.serviceUrl) {
            throw new Error("Permission service url is invalid");
        }

        if (entityTypes.length === 0 ||
            actions.length === 0) {
            return {isPermitted: false};
        }

        for (let entityType of entityTypes) {
            const isPermitted = await this.areActionsPermittedOnEntity(upn, reality, entityType, actions, permissionHeaders);
            if (!isPermitted) {
                return { isPermitted: false };
            }
        }

        return {isPermitted: true, /*TODO digital filters*/}
    }

    private async areActionsPermittedOnEntity(upn: string, reality: string, entityType: string, actions: string[], permissionHeaders: { [name: string]: string | string[] }): Promise<boolean> {
        const requestUrlForType: string = `${this.serviceUrl}/user/permissions/${upn}/${reality}/${entityType}`;

        try {
            if (!this.permissionsCacheHolder.isCached(entityType)) {
                const permissionResponse = await this.sendRequestToExternalService(requestUrlForType, permissionHeaders);
                if (permissionResponse.status !== 200){
                    throw new Error(`Status response ${permissionResponse.status} is received when access external permissions service`);
                }

                
            }
        } catch (e) {

        }

        return true;
    }

    private async sendRequestToExternalService(requestUrlForType: string, permissionHeaders: { [p: string]: string | string[] }) : Promise<any> {
        const result = await axios(requestUrlForType, {method:"get", headers: permissionHeaders});
    }
}