import {GraphQLExtension, GraphQLResponse} from "graphql-extensions";

export default class IrrelevantEntitiesExtension extends GraphQLExtension {
    willSendResponse(responseContext: {
        graphqlResponse: GraphQLResponse;
        context: any;
    }) {
        const {context, graphqlResponse} = responseContext;
        context.logger? context.logger.debug('Irrelevant entities extension started instrumenting'): {};
        if (context.dataVersion) {
            graphqlResponse.extensions = {
                irrelevantEntities: context.irrelevantEntities,
            };
        }
        context.logger? context.logger.debug('Irrelevant entities extension finished instrumenting'): {};
        return responseContext;
    }
}
