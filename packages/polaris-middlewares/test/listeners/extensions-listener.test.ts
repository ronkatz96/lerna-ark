import { ExtensionsListener } from '../../src';
import { getContextWithRequestHeaders } from '../context-util';
import { PolarisGraphQLContext } from '@enigmatis/polaris-common';

describe('data-version extensions listener test', () => {
    describe('data version repository supplied', () => {
        describe('data version repo returns a data version value', () => {
            let dataVersionRepo: any;
            let extension: any;
            beforeEach(() => {
                dataVersionRepo = {
                    findOne: async () => {
                        return { id: 1, value: 2 };
                    },
                };
                extension = new ExtensionsListener(dataVersionRepo);
            });
            describe('context has data version', () => {
                let requestContext: PolarisGraphQLContext;
                let findSpy: any;
                beforeEach(() => {
                    requestContext = getContextWithRequestHeaders({ dataVersion: 3 });
                    findSpy = jest.spyOn(dataVersionRepo, 'findOne');
                });
                describe('context has global data version', () => {
                    beforeEach(() => {
                        requestContext.returnedExtensions.globalDataVersion = 4;
                    });
                    it('response extensions contain global data version and repo is not called', async () => {
                        const response = await extension.willSendResponse(requestContext);
                        expect(response.response.extensions).toMatchObject({ dataVersion: 4 });
                        expect(dataVersionRepo.findOne).not.toHaveBeenCalled();
                    });
                });
                describe('context has no global data version', () => {
                    it('response extensions contain global data version and repo is called', async () => {
                        const response = await extension.willSendResponse(requestContext);
                        expect(response.response.extensions).toMatchObject({ dataVersion: 2 });
                        expect(dataVersionRepo.findOne).toHaveBeenCalledTimes(1);
                    });
                });
            });
            describe('context has no data version', () => {
                let requestContext: PolarisGraphQLContext;
                beforeEach(() => {
                    requestContext = getContextWithRequestHeaders({});
                });
                it('response extensions contain global data version', async () => {
                    const response = await extension.willSendResponse(requestContext);
                    expect(response.response.extensions).toMatchObject({ dataVersion: 2 });
                });
            });
        });
    });
    describe('no data version repository supplied', () => {
        let extension: any;
        beforeEach(() => {
            extension = new ExtensionsListener();
        });
        describe('context has data version', () => {
            let requestContext: PolarisGraphQLContext;
            beforeEach(() => {
                requestContext = getContextWithRequestHeaders({ dataVersion: 2 });
            });
            it('response should contain irrelevant entities if its supplied in context', async () => {
                const irrelevantEntities = { blabla: 'blabla' };
                requestContext.returnedExtensions.irrelevantEntities = irrelevantEntities;
                const response = await extension.willSendResponse(requestContext);
                expect(response.response.extensions).toEqual({ irrelevantEntities });
            });
            it('response should contain an undefined irrelevant entities object if its not supplied in context', async () => {
                const response = await extension.willSendResponse(requestContext);
                expect(response.response.extensions.irrelevantEntities).toBeUndefined();
            });
        });

        describe('context has no data version', () => {
            let requestContext: PolarisGraphQLContext;
            beforeEach(() => {
                requestContext = getContextWithRequestHeaders({});
            });
            it('response should contain an undefined irrelevant entities object', async () => {
                const response = await extension.willSendResponse(requestContext);
                expect(response.response.extensions.irrelevantEntities).toBeUndefined();
            });
        });
    });
});
