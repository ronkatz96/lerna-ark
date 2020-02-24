import { loggerPluginMessages } from '../../src/logger-plugin/logger-plugin-messages';
import { PolarisRequestListener } from '../../src/logger-plugin/polaris-request-listener';
import { loggerMock } from '../mocks/logger-mock';

describe('RequestListenerForLoggerPlugin tests', () => {
    const listener = new PolarisRequestListener(loggerMock as any);
    const context: any = {
        response: {
            data: jest.fn(),
            extensions: jest.fn(),
            errors: jest.fn(),
        },
    };
    const requestContext: any = { context };

    describe('willSendResponse tests', () => {
        test('a log is written with response', async () => {
            await listener.willSendResponse(requestContext);

            expect(loggerMock.info).toHaveBeenCalledWith(loggerPluginMessages.responseSent, {
                response: {
                    data: context.response.data,
                    extensions: context.response.extensions,
                    errors: context.response.errors,
                },
            });
        });
    });
    describe('executionDidStart tests', () => {
        test('a log is written', () => {
            listener.executionDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledWith(
                loggerPluginMessages.executionBegan,
                context,
            );
        });
    });
    describe('parsingDidStart tests', () => {
        test('a log is written', () => {
            listener.parsingDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledWith(
                loggerPluginMessages.parsingBegan,
                context,
            );
        });
    });
    describe('validationDidStart tests', () => {
        test('a log is written', () => {
            listener.validationDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledWith(
                loggerPluginMessages.validationBegan,
                context,
            );
        });
    });
});
