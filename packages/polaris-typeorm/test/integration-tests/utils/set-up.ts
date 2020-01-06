import { PolarisExtensions, PolarisGraphQLContext, PolarisRequestHeaders } from '@enigmatis/polaris-common';
import { PolarisLogger } from '@enigmatis/polaris-logs';
import { Connection } from 'typeorm';
import { createPolarisConnection, PolarisSaveOptions } from '../../../src';
import { Author } from '../../dal/author';
import { Book } from '../../dal/book';
import { Library } from '../../dal/library';
import { Profile } from '../../dal/profile';
import { User } from '../../dal/user';
import { applicationLogProperties, connectionOptions, loggerConfig } from './test-properties';

export const setUpTestConnection = async (): Promise<Connection> => {
    const polarisGraphQLLogger = await new PolarisLogger(loggerConfig, applicationLogProperties);
    const connection = await createPolarisConnection(connectionOptions, polarisGraphQLLogger);
    const tables = ['user', 'profile', 'book', 'author', 'library', 'dataVersion'];
    for (const table of tables) {
        if (connection.manager) {
            try {
                await connection.manager.getRepository(table).query('DELETE FROM "' + table + '";');
            } catch (e) {
                polarisGraphQLLogger.error(e.message);
            }
        }
    }
    return connection;
};

export const profile = new Profile('female');
export const user = new User('chen', profile);
export const rowling = 'J.K Rowling';
export const mrCascade = 'Mr Cascade';
export const harryPotter = 'Harry Potter and the Chamber of Secrets';
export const cascadeBook = 'Cascade Book';

export const initDb = async (connection: Connection) => {
    const context = { requestHeaders: { realityId: 0 } } as any;
    const hpBook = new Book(harryPotter);
    const cbBook = new Book(cascadeBook);
    const rowlingAuthor = new Author(rowling, [hpBook]);
    const cascadeAuthor = new Author(mrCascade, [cbBook]);
    cbBook.author = cascadeAuthor;
    await connection.manager.save(Profile, new PolarisSaveOptions(profile, context) as any);
    await connection.manager.save(User, new PolarisSaveOptions(user, context) as any);
    await connection.manager.save(
        Author,
        new PolarisSaveOptions([rowlingAuthor, cascadeAuthor], context) as any,
    );
    await connection.manager.save(Book, new PolarisSaveOptions([hpBook, cbBook], context) as any);
    await connection.manager.save(
        Library,
        new PolarisSaveOptions(new Library('public', [cbBook]), context) as any,
    );
};

export function setHeaders(connection: Connection, headers?: PolarisRequestHeaders): void {
    if (connection.manager.queryRunner && connection.manager.queryRunner.data) {
        connection.manager.queryRunner.data.requestHeaders = headers || {};
    }
}

export function generateContext(
    headers?: PolarisRequestHeaders,
    extensions?: PolarisExtensions,
): PolarisGraphQLContext {
    return {
        requestHeaders: headers || {},
        returnedExtensions: extensions || {},
    } as PolarisGraphQLContext;
}

export function getHeaders(connection: Connection): PolarisRequestHeaders {
    return (
        connection.manager.queryRunner &&
        connection.manager.queryRunner.data &&
        connection.manager.queryRunner.data.requestHeaders
    );
}

export function setExtensions(connection: Connection, extensions?: PolarisExtensions): void {
    if (connection.manager.queryRunner && connection.manager.queryRunner.data) {
        connection.manager.queryRunner.data.returnedExtensions = extensions || {};
    }
}

export function getExtensions(connection: Connection): PolarisExtensions {
    return (
        connection.manager.queryRunner &&
        connection.manager.queryRunner.data &&
        connection.manager.queryRunner.data.returnedExtensions
    );
}
