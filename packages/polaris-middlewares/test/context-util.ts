import { PolarisGraphQLContext, PolarisRequestHeaders } from '@enigmatis/polaris-common';

export const getContextWithRequestHeaders = (
    requestHeaders: PolarisRequestHeaders,
): PolarisGraphQLContext => {
    return {
        requestHeaders,
        request: { query: 'foo' },
        response: jest.fn(),
        returnedExtensions: { globalDataVersion: 5 },
        responseHeaders: {},
        clientIp: 'bar',
        reality: { id: 0 },
    };
};
