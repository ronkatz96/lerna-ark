import {Connection, ConnectionOptions, createConnection} from "typeorm";
import {PolarisEntityManager} from "../polaris-entity-manager";
import {PolarisContext, TypeORMConfig} from "../common-polaris";
import {PolarisGraphQLLogger} from "@enigmatis/polaris-graphql-logger";

export async function createPolarisConnection(options: ConnectionOptions, logger: PolarisGraphQLLogger<PolarisContext>,
                                              config?: TypeORMConfig): Promise<Connection> {
    let connection = await createConnection(options);
    // @ts-ignore
    connection.manager = new PolarisEntityManager(connection, config, logger);
    return connection;
}