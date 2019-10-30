import {ConnectionOptions} from "typeorm";
import {CommonModel} from "../../src";
import {DataVersion} from "../../src";
import {ApplicationLogProperties, LoggerConfiguration} from "@enigmatis/polaris-logs";

const path = require('path');
export const connectionOptions: ConnectionOptions = {
    type: "postgres",
    url: process.env.CONNECTION_STRING ? process.env.CONNECTION_STRING : "",
    entities: [
        path.resolve(__dirname, '..') + '/dal/*.ts',
        CommonModel,
        DataVersion
    ],
    synchronize: true,
    logging: false
};

export const applicationLogProperties: ApplicationLogProperties = {
    id: 'example',
    name: 'example',
    component: 'repo',
    environment: 'dev',
    version: '1'
};

export const loggerConfig: LoggerConfiguration = {
    loggerLevel: 'debug',
    writeToConsole: true,
    writeFullMessageToConsole: false
};
