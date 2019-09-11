import {ExtensionsListener} from "../../src/plugins/extensions-plugin";
import * as sinon from 'sinon';
import * as chai from 'chai';

const expect = chai.expect;
const sinonChai = require("sinon-chai");

chai.use(sinonChai);

describe('data-version extensions plugin test', () => {
    describe('data version repository supplied', () => {
        describe('data version repo returns a data version value', () => {
            let dataVersionRepo;
            let extension;
            beforeEach(() => {
                dataVersionRepo = {
                    find: async () => {
                        return [{id: 1, value: 2}];
                    }
                };
                extension = new ExtensionsListener(dataVersionRepo);
            });
            describe('context has data version', () => {
                let requestContext;
                let findSpy;
                beforeEach(() => {
                    requestContext = {
                        response: {data: {}, errors: []},
                        context: {dataVersion: 3}
                    };
                    findSpy = sinon.spy(dataVersionRepo, 'find');

                });
                describe('context has global data version', () => {
                    beforeEach(() => {
                        requestContext.context['globalDataVersion'] = 4;
                    });
                    it('response extensions contain global data version and repo is not called', async () => {
                        const response = await extension.willSendResponse(requestContext);
                        expect(response.context).to.deep.equal(requestContext.context);
                        expect(response.response.extensions).to.contain({dataVersion: 4});
                        expect(findSpy.notCalled).to.be.true;
                    });
                });
                describe('context has no global data version', () => {
                    it('response extensions contain global data version and repo is called', async () => {
                        const response = await extension.willSendResponse(requestContext);
                        expect(response.context).to.deep.equal(requestContext.context);
                        expect(response.response.extensions).to.contain({dataVersion: 2});
                        expect(findSpy.calledOnce).to.be.true;
                    });
                });
            });
            describe('context has no data version', () => {
                let requestContext;
                beforeEach(() => {
                    requestContext = {
                        response: {data: {}, errors: []},
                        context: {}
                    };
                });
                it('response extensions contain global data version', async () => {
                    const response = await extension.willSendResponse(requestContext);
                    expect(response.context).to.deep.equal(requestContext.context);
                    expect(response.response.extensions).to.contain({dataVersion: 2});
                });
            });
        });

    });
    describe('no data version repository supplied', () => {
        let extension;
        beforeEach(() => {
            extension = new ExtensionsListener();
        });
        describe('context has data version', () => {
            let requestContext;
            beforeEach(() => {
                requestContext = {
                    response: {data: {}, errors: []},
                    context: {dataVersion: 2}
                };
            });
            it('response should contain irrelevant entities if its supplied in context', async () => {
                const irrelevantEntities = {blabla: "blabla"};
                requestContext.context['irrelevantEntities'] = irrelevantEntities;
                const response = await extension.willSendResponse(requestContext);
                expect(response.context).to.deep.equal({dataVersion: 2, irrelevantEntities: irrelevantEntities});
                expect(response.response.extensions).to.deep.equal({irrelevantEntities});
            });
            it('response should contain an undefined irrelevant entities object if its not supplied in context', async () => {
                const response = await extension.willSendResponse(requestContext);
                expect(response.context).to.deep.equal({dataVersion: 2});
                expect(response.response.extensions.irrelevantEntities).to.be.undefined;
            });
        });

        describe('context has no data version', () => {
            let requestContext;
            beforeEach(() => {
                requestContext = {response: {data: {}, errors: [], extensions: {}}, context: {}};
            });
            it('response should contain an undefined irrelevant entities object', async () => {
                const response = await extension.willSendResponse(requestContext);
                expect(response.context).to.deep.equal({});
                expect(response.response.extensions.irrelevantEntities).to.be.undefined;
            });
        });
    });
});