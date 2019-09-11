import {expect} from "chai";
import {ExtensionsListener} from "../../src/plugins/extensions-plugin";

describe('data-version extensions plugin test', () => {
    const extension = new ExtensionsListener();
    describe('context has data version', () => {
        const requestContext = {
            response: {data: {}, errors: []},
            context: {dataVersion: 2}
        };
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
        const requestContext = {response: {data: {}, errors: [], extensions: {}}, context: {}};
        it('response should contain an undefined irrelevant entities object', async () => {
            const response = await extension.willSendResponse(requestContext);
            expect(response.context).to.deep.equal({});
            expect(response.response.extensions.irrelevantEntities).to.be.undefined;
        });
    });
});