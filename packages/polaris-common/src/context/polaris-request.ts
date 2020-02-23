export interface PolarisGraphQLRequest {
    query: string;
    operationName?: string;
    variables?: Map<string, any>;
}
