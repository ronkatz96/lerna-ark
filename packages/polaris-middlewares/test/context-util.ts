import { PolarisRequestHeaders } from '@enigmatis/polaris-common';

export const getContextWithRequestHeaders = (requestHeaders: PolarisRequestHeaders) => {
    return {
        requestHeaders,
        request: { query: 'foo' },
        response: jest.fn(),
        returnedExtensions: { globalDataVersion: 5 },
        responseHeaders: {},
        clientIp: 'bar',
    };
};
