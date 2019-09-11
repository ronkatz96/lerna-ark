import {ApolloServerPlugin, GraphQLRequestListener} from "apollo-server-plugin-base";
import {GraphQLRequestContext} from "apollo-server-plugin-base";
import {DeltaMiddlewareContext} from "../delta-middleware-context";


export class ExtensionsPlugin implements ApolloServerPlugin {
    private dataVersionRepository: any;


    constructor(dataVersionRepository?: any) {
        this.dataVersionRepository = dataVersionRepository;
    }

    requestDidStart<TContext>(requestContext: GraphQLRequestContext<TContext>): GraphQLRequestListener<TContext> | void {
        return new ExtensionsListener(this.dataVersionRepository);
    }
}

export class ExtensionsListener implements GraphQLRequestListener {
    private dataVersionRepository: any;


    constructor(dataVersionRepository?: any) {
        dataVersionRepository ? this.dataVersionRepository = dataVersionRepository : {};
    }


    async willSendResponse(requestContext) {
        const {context, response}: { context: DeltaMiddlewareContext, response: any } = requestContext;
        context.logger ? context.logger.debug('Data Version extension started instrumenting', {context}) : {};
        !response.extensions ? response.extensions = {} : {};

        if (context.dataVersion) {
            context.irrelevantEntities ? response.extensions.irrelevantEntities = context.irrelevantEntities : {};
        }

        if (context.globalDataVersion) {
            response.extensions.dataVersion = context.globalDataVersion;
        } else {
            if (this.dataVersionRepository) {
                try {
                    let result = await this.dataVersionRepository.find();
                    if (result.length >= 1) {
                        response.extensions.dataVersion = result[0].value;
                    }
                    context.logger ? context.logger.debug('Data Version extension finished instrumenting', {context}) : {};
                }
                catch (err) {
                    context.logger ? context.logger.error('Error fetching data version for extensions', {
                        context,
                        graphqlLogProperties: {throwable: err}
                    }) : {};
                }
            }
        }

        return requestContext;
    }
}
