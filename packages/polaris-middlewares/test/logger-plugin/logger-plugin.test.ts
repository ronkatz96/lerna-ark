import { PolarisLoggerPlugin } from '../../src';
import { REQUEST_RECEIVED } from '../../src/logger-plugin/logger-plugin-messages';
import { loggerMock } from '../mocks/logger-mock';

describe('LoggerPlugin tests', () => {
    const loggerPlugin = new PolarisLoggerPlugin(loggerMock as any);
    const context: any = {
        request: {
            query: jest.fn(),
            operationName: jest.fn(),
            variables: jest.fn(),
        },
    };
    const requestContext: any = { context };

    describe('requestDidStart tests', () => {
        test('a log is written', () => {
            loggerPlugin.requestDidStart(requestContext);

            expect(loggerMock.info).toHaveBeenCalledWith(
                REQUEST_RECEIVED,
                context,
            );
        });
    });
});
