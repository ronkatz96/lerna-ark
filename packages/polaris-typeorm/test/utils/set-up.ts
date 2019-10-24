import {Connection} from "typeorm";
import {Book} from "../dal/book";
import {Author} from "../dal/author";
import {createPolarisConnection} from "../../src/connections/create-connection";
import {Profile} from "../dal/profile";
import {User} from "../dal/user";
import {PolarisGraphQLLogger} from "@enigmatis/polaris-graphql-logger"
import {applicationLogProperties, connectionOptions, loggerConfig} from "./test-properties";
import {TypeORMConfig} from "../../src/common-polaris";


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
};