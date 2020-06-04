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
                return {isPermitted: false};
            }
        }

        return {isPermitted: true, /*TODO digital filters*/}
    }

    private async areActionsPermittedOnEntity(upn: string, reality: string, entityType: string, actions: string[], permissionHeaders: { [name: string]: string | string[] }): Promise<boolean> {
        const requestUrlForType: string = `${this.serviceUrl}/user/permissions/${upn}/${reality}/${entityType}`;

        try {
            if (!this.permissionsCacheHolder.isCached(entityType)) {
                const permissionResponse = await this.sendRequestToExternalService(requestUrlForType, permissionHeaders);
                if (permissionResponse.status !== 200) {
                    throw new Error(`Status response ${permissionResponse.status} is received when access external permissions service`);
                }

                const permittedActions = this.getPermittedActionsFromResponse(permissionResponse, entityType);

                for (let action of actions) {
                    if (!permittedActions.includes(action)) {
                        return false;
                    }
                }
            }
        } catch (e) {
            throw new Error(e);
        }

        return true;
    }

    private async sendRequestToExternalService(requestUrlForType: string, permissionHeaders: { [p: string]: string | string[] }): Promise<any> {
        const timeStart = new Date().getTime();
        this.logger.info("Sending request to external permissions service", {
            customProperties: {
                "requestUrl": requestUrlForType,
                "requestDestination": this.serviceUrl,
                "requestHeaders": permissionHeaders,
            }
        });
        const result = await axios(requestUrlForType, {method: "get", headers: permissionHeaders});
        this.logger.info("Finished request to external permissions server",
            {
                response: result,
                elapsedTime: (new Date().getTime() - timeStart),
                customProperties: {
                    "responseHttpCode": result.status,
                    "responseHeaders": result.headers,
                }
            });
        return result;
    }

    private getPermittedActionsFromResponse(permissionResponse: any, entityType: string): string[] {
        const entityTypeActions = permissionResponse?.userPermissions[entityType];
        let permittedActions: string[] = [];
        let actionsDigitalFilters: { [type: string]: any } = {};

        for (const [action, value] of Object.entries(entityTypeActions)) {
            const isPermitted: boolean = (value as any).isPermitted;
            const digitalFilters: any = (value as any).digitalFilters;

            if (isPermitted) {
                permittedActions.push(action);
                actionsDigitalFilters[action] = digitalFilters;
            }
        }

        this.permissionsCacheHolder.addPermissions(entityType, permittedActions);
        // TODO digital filters

        return permittedActions;
    }
}