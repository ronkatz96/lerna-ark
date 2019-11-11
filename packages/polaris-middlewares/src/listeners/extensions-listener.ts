import { GraphQLRequestListener } from 'apollo-server-plugin-base';
import { PolarisExtensions, PolarisRequestHeaders } from '@enigmatis/polaris-common';

export class ExtensionsListener implements GraphQLRequestListener {
    private readonly dataVersionRepository: any;

    constructor(dataVersionRepository?: any) {
        if (dataVersionRepository) {
            this.dataVersionRepository = dataVersionRepository;
        }
    }

    async willSendResponse(requestContext: any) {
        const {
            requestHeaders,
            returnedExtensions,
            response,
        }: {
            requestHeaders: PolarisRequestHeaders;
            returnedExtensions: PolarisExtensions;
            response: any;
        } = requestContext;
        // if (context.logger) {
        //     context.logger.debug('Data Version extension started instrumenting', { context });
        // }
        if (!response.extensions) {
            response.extensions = {};
        }

        if (requestHeaders.dataVersion) {
            if (returnedExtensions.irrelevantEntities) {
                response.extensions.irrelevantEntities = returnedExtensions.irrelevantEntities;
            }
        }

        if (returnedExtensions.globalDataVersion) {
            response.extensions.dataVersion = returnedExtensions.globalDataVersion;
        } else {
            if (this.dataVersionRepository) {
                try {
                    const result = await this.dataVersionRepository.findOne();
                    if (result) {
                        response.extensions.dataVersion = result.value;
                    }
                    // if (context.logger) {
                    //     context.logger.debug('Data Version extension finished instrumenting', {
                    //         context,
                    //     });
                    // }
                } catch (err) {
                    // if (context.logger) {
                    //     context.logger.error('Error fetching data version for extensions', {
                    //         context,
                    //         graphqlLogProperties: { throwable: err },
                    //     });
                    // }
                }
            }
        }

        return requestContext;
    }
}
