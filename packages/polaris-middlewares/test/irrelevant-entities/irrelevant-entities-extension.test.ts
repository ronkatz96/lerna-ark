import IrrelevantEntitiesExtension from "../../src/irrelevant-entities/irrelevant-entities-extension";
import {expect} from "chai";

describe('irrelevant entities extension tests', () => {
    describe('context has data version', () => {
        it('response should contain irrelevant entities if its supplied in context', async () => {
            const extension = new IrrelevantEntitiesExtension();
            const irrelevantEntities = {blabla: "blabla"};
            const responseContext = {
                graphqlResponse: {data: {}, errors: []},
                context: {dataVersion: 2, irrelevantEntities: irrelevantEntities}
            };
            const response = extension.willSendResponse(responseContext);
            expect(response.context).to.deep.equal({dataVersion: 2, irrelevantEntities: irrelevantEntities});
            expect(response.graphqlResponse.extensions).to.deep.equal({irrelevantEntities});
        });

        it('response should contain an undefined  irrelevant entities object if its not supplied in context', async () => {
            const extension = new IrrelevantEntitiesExtension();
            const responseContext = {graphqlResponse: {data: {}, errors: []}, context: {dataVersion: 2}};
            const response = extension.willSendResponse(responseContext);
            expect(response.context).to.deep.equal({dataVersion: 2});
            expect(response.graphqlResponse.extensions.irrelevantEntities).to.be.undefined;
        });
    });

    describe('context has no data version', () => {
        it('response should contain an undefined irrelevant entities object', async () => {
            const extension = new IrrelevantEntitiesExtension();
            const responseContext = {graphqlResponse: {data: {}, errors: [], extensions: {}}, context: {}};
            const response = extension.willSendResponse(responseContext);
            expect(response.context).to.deep.equal({});
            expect(response.graphqlResponse.extensions.irrelevantEntities).to.be.undefined;
        });
    });
});