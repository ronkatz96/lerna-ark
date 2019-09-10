import {GraphQLExtension, GraphQLResponse} from "graphql-extensions";

export default class DataVersionExtensions extends GraphQLExtension {
    private dataVersionRepository: any;


    constructor(dataVersionRepository?: any) {
        super();
        dataVersionRepository ? this.dataVersionRepository = dataVersionRepository : {};
    }

    willSendResponse(responseContext: {
        graphqlResponse: GraphQLResponse;
        context: any;
    }) {
        const {context, graphqlResponse} = responseContext;
        context.logger ? context.logger.debug('Data Version extension started instrumenting') : {};
        if (context.dataVersion) {
            !graphqlResponse.extensions ? graphqlResponse.extensions = {} : {};
            context.irrelevantEntities ? graphqlResponse.extensions.irrelevantEntities = context.irrelevantEntities : {};
            if (context.globalDataVersion) {
                graphqlResponse.extensions.dataVersion = context.globalDataVersion;
            } else {
                this.dataVersionRepository ? this.dataVersionRepository.find().then(result => {
                    console.log(result);
                    if (result.length >= 1) {
                        graphqlResponse.extensions.dataVersion = result[0].value;
                    }
                }).catch(err => {
                    context.logger ? context.logger.warn(err) : {};
                }) : {};
            }
        }
        context.logger ? context.logger.debug('Data Version extension finished instrumenting') : {};
        return responseContext;
    }
}
