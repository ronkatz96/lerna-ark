import {
    PolarisExtensions,
    PolarisGraphQLContext,
    PolarisRequestHeaders,
} from '@enigmatis/polaris-common';
import { PolarisLogger } from '@enigmatis/polaris-logs';
import { createPolarisConnection, PolarisConnection } from '../../../src';
import { Author } from '../../dal/author';
import { Book } from '../../dal/book';
import { Library } from '../../dal/library';
import { Profile } from '../../dal/profile';
import { User } from '../../dal/user';
import {
    authorRepo,
    bookRepo,
    libraryRepo,
    profileRepo,
    userRepo,
} from '../postgres-tests/polaris-repository.test';
import { applicationLogProperties, connectionOptions, loggerConfig } from './test-properties';

export const setUpTestConnection = async (): Promise<PolarisConnection> => {
    const polarisGraphQLLogger = await new PolarisLogger(loggerConfig, applicationLogProperties);
    const connection: PolarisConnection = await createPolarisConnection(
        connectionOptions,
        polarisGraphQLLogger,
    );
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

export const gender: string = 'female';
export const userName: string = 'chen';
export const rowling = 'J.K Rowling';
export const mrCascade = 'Mr Cascade';
export const harryPotter = 'Harry Potter and the Chamber of Secrets';
export const cascadeBook = 'Cascade Book';

export const initDb = async () => {
    const context = { requestHeaders: { realityId: 0 } } as any;
    const hpBook = new Book(harryPotter);
    const cbBook = new Book(cascadeBook);
    const rowlingAuthor = new Author(rowling, [hpBook]);
    const cascadeAuthor = new Author(mrCascade, [cbBook]);
    cbBook.author = cascadeAuthor;
    const profile: Profile = new Profile(gender);
    await profileRepo.save(context, profile);
    await userRepo.save(context, new User(userName, profile));
    await authorRepo.save(context, [rowlingAuthor, cascadeAuthor]);
    await bookRepo.save(context, [hpBook, cbBook]);
    await libraryRepo.save(context, new Library('public', [cbBook]));
};

export function setHeaders(connection: PolarisConnection, headers?: PolarisRequestHeaders): void {
    if (connection?.manager?.queryRunner?.data) {
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
