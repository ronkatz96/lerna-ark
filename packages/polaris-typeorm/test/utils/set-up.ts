import { PolarisBaseContext } from '@enigmatis/polaris-common';
import { PolarisLogger } from '@enigmatis/polaris-logs';
import { Connection } from 'typeorm';
import { createPolarisConnection } from '../../src';
import { Author } from '../dal/author';
import { Book } from '../dal/book';
import { Library } from '../dal/library';
import { Profile } from '../dal/profile';
import { User } from '../dal/user';
import { applicationLogProperties, connectionOptions, loggerConfig } from './test-properties';

export const setUpTestConnection = async (): Promise<Connection> => {
    const polarisGraphQLLogger = await new PolarisLogger(applicationLogProperties, loggerConfig);
    const connection = await createPolarisConnection(connectionOptions, polarisGraphQLLogger);
    const tables = ['user', 'profile', 'book', 'author', 'library', 'dataVersion'];
    for (const table of tables) {
        if (connection.manager) {
            await connection.manager.getRepository(table).query('DELETE FROM "' + table + '";');
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
    const hpBook = new Book(harryPotter);
    const cbBook = new Book(cascadeBook);
    const rowlingAuthor = new Author(rowling, [hpBook]);
    const cascadeAuthor = new Author(mrCascade, [cbBook]);
    cbBook.author = cascadeAuthor;
    await connection.manager.save(Profile, profile);
    await connection.manager.save(User, user);
    await connection.manager.save(Author, [rowlingAuthor, cascadeAuthor]);
    await connection.manager.save(Book, [hpBook, cbBook]);
    await connection.manager.save(Library, new Library('public', [cbBook]));
};

export function setContext(connection: Connection, context?: PolarisBaseContext): void {
    if (connection.manager.queryRunner) {
        connection.manager.queryRunner.data.context = context || {};
    }
}

export function getContext(connection: Connection): PolarisBaseContext {
    return !connection.manager.queryRunner || connection.manager.queryRunner.data.context;
}
