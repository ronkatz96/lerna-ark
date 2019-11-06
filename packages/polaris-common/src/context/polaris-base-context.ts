import { PolarisRequestHeaders } from '../headers/polaris-request-headers';
import { PolarisResponseHeaders } from '../headers/polaris-response-headers';

export interface PolarisBaseContext {
    requestHeaders: PolarisRequestHeaders;
    responseHeaders: PolarisResponseHeaders;
    clientIp: string;
}
