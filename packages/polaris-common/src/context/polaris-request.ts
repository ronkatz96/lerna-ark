export interface PolarisGraphQLRequest {
    query: string;
    operationName?: string;
    polarisVariables?: Map<string, any>;
}
