import {Connection} from "typeorm";
import {Book} from "../dal/book";
import {Author} from "../dal/author";
import {createPolarisConnection} from "../../src/connections/create-connection";
import {Profile} from "../dal/profile";
import {User} from "../dal/user";
// @ts-ignore
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
export const authorName1 = 'J.K Rowling';
export const authorName2 = 'Mr Cascade';
export const bookName1 = 'Harry Potter and the Chamber of Secrets';
export const bookName2 = 'Cascade Book';
export const initDb = async (connection: Connection) => {
    const books = [
        new Book(bookName1),
        new Book(bookName2)];

    const authors = [
        new Author(authorName1, [books[0]]),
        new Author(authorName2, [books[1]])];

    books[1].author = authors[1];
    await connection.manager.save(Profile, profile);
    await connection.manager.save(User, user);
    await connection.manager.save(Book, books);
    await connection.manager.save(Author, authors);
};