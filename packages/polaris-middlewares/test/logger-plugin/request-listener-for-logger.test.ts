import { loggerPluginMessages } from '../../src/logger-plugin/logger-plugin-messages';
import { RequestListenerForLoggerPlugin } from '../../src/logger-plugin/request-listener-for-logger';
import { loggerMock } from '../mocks/logger-mock';

describe('RequestListenerForLoggerPlugin tests', () => {
    const requestContext = { context: jest.fn(), response: jest.fn() };
    const listener = new RequestListenerForLoggerPlugin(loggerMock as any);
    describe('willSendResponse tests', () => {
        test('a log is written with response', async () => {
            // act
            await listener.willSendResponse(requestContext as any);
            // assert
            expect(loggerMock.info).toHaveBeenCalledWith(loggerPluginMessages.responseSent, {
                context: requestContext.context,
                polarisLogProperties: { response: requestContext.response },
            });
        });
    });
    describe('executionDidStart tests', () => {
        test('a log is written', () => {
            // act
            listener.executionDidStart(requestContext as any);
            // assert
            expect(loggerMock.debug).toHaveBeenCalledWith(loggerPluginMessages.executionBegan, {
                context: requestContext.context,
            });
        });
    });
    describe('parsingDidStart tests', () => {
        test('a log is written', () => {
            // act
            listener.parsingDidStart(requestContext as any);
            // assert
            expect(loggerMock.debug).toHaveBeenCalledWith(loggerPluginMessages.parsingBegan, {
                context: requestContext.context,
            });
        });
    });
    describe('validationDidStart tests', () => {
        test('a log is written', () => {
            // act
            listener.validationDidStart(requestContext as any);
            // assert
            expect(loggerMock.debug).toHaveBeenCalledWith(loggerPluginMessages.validationBegan, {
                context: requestContext.context,
            });
        });
    });
});
