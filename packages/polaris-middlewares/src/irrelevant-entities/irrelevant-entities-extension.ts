import {GraphQLExtension, GraphQLResponse} from "graphql-extensions";

export default class IrrelevantEntitiesExtension extends GraphQLExtension {
    willSendResponse(responseContext: {
        graphqlResponse: GraphQLResponse;
        context: any;
    }) {
        const {context, graphqlResponse} = responseContext;

        if (context.dataVersion) {
            graphqlResponse.extensions = {
                irrelevantEntities: context.irrelevantEntities,
            };
        }
        return responseContext;
    }
}
