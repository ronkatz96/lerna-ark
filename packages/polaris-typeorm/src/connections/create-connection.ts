import {ConnectionOptions, createConnection} from "typeorm";
import {PolarisEntityManager} from "../polaris-entity-manager";
import {TypeORMConfig} from "../common-polaris";
import {PolarisLogger} from "@enigmatis/polaris-logs";
import {PolarisTypeormLogger} from "../polaris-typeorm-logger";

export async function createPolarisConnection(options: ConnectionOptions, logger: PolarisLogger, config?: TypeORMConfig) {
    Object.assign(options, {logger: new PolarisTypeormLogger(logger, options.logging)});
    Object.assign(options.extra, {config: config || {}});
    let connection = await createConnection(options);
    Object.defineProperty(connection, "manager", {value: new PolarisEntityManager(connection)});
    return connection;
}