import {Connection} from "typeorm";
import {Book} from "../dal/book";
import {Author} from "../dal/author";
import {Profile} from "../dal/profile";
import {User} from "../dal/user";
import {PolarisGraphQLLogger} from "@enigmatis/polaris-graphql-logger"
import {applicationLogProperties, connectionOptions, loggerConfig} from "./test-properties";
import {PolarisContext, TypeORMConfig} from "../../src/common-polaris";
import {Library} from "../dal/library";
import {createPolarisConnection} from "../../src";


export const setUpTestConnection = async (polarisConfig?: TypeORMConfig) => {
    const polarisGraphQLLogger = await new PolarisGraphQLLogger(applicationLogProperties, loggerConfig);
    let connection = await createPolarisConnection(connectionOptions, polarisGraphQLLogger, polarisConfig);
    await connection.dropDatabase();
    await connection.synchronize();
    return connection;
};

export const profile = new Profile("female");
export const user = new User("chen", profile);
export const rowling = 'J.K Rowling';
export const mrCascade = 'Mr Cascade';
export const harryPotter = 'Harry Potter and the Chamber of Secrets';
export const cascadeBook = 'Cascade Book';
export const initDb = async (connection: Connection) => {
    const hpBook = new Book(harryPotter);
    const cbBook = new Book(cascadeBook);
    const rowlingAuthor = new Author(rowling, [hpBook]);
    const cascadeAuthor = new Author(mrCascade, [cbBook]);
    cbBook.author = cascadeAuthor;
    await connection.manager.save(Profile, profile);
    await connection.manager.save(User, user);
    await connection.manager.save(Author, [rowlingAuthor, cascadeAuthor]);
    await connection.manager.save(Book, [hpBook, cbBook]);
    await connection.manager.save(Library, new Library("public",[cbBook]));
};

export function setContext(connection: Connection, context: PolarisContext): void {
    connection.manager.queryRunner && connection.manager.queryRunner.data ?
        connection.manager.queryRunner.data.context = context : {};
}

export function getContext(connection: Connection): PolarisContext {
    return connection.manager.queryRunner && connection.manager.queryRunner.data ?
        connection.manager.queryRunner.data.context : {};
}