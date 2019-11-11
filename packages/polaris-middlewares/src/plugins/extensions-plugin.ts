import {
    ApolloServerPlugin,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { ExtensionsListener } from '..';

export class ExtensionsPlugin implements ApolloServerPlugin {
    private readonly dataVersionRepository: any;

    constructor(dataVersionRepository?: any) {
        this.dataVersionRepository = dataVersionRepository;
    }

    requestDidStart<TContext>(
        requestContext: GraphQLRequestContext<TContext>,
    ): GraphQLRequestListener<TContext> | void {
        return new ExtensionsListener(this.dataVersionRepository);
    }
}
