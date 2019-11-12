import { Connection } from 'typeorm';
import { DataVersion } from '../../../src';
import { Author } from '../../dal/author';
import { Book } from '../../dal/book';
import { Library } from '../../dal/library';
import { Profile } from '../../dal/profile';
import { User } from '../../dal/user';
import {
    cascadeBook,
    harryPotter,
    initDb,
    mrCascade,
    profile,
    rowling,
    setHeaders,
    setUpTestConnection,
    user,
} from '../utils/set-up';

const testBookCriteria = { where: { title: harryPotter } };
const testAuthorCriteria = { where: { name: rowling } };

export const bookWithCascadeCriteria = { where: { title: cascadeBook } };
export const authorWithCascadeCriteria = { where: { name: mrCascade } };

export const userCriteria = { where: { name: user.name } };
const profileCriteria = { where: { gender: profile.gender } };

let connection: Connection;

describe('entity manager tests', () => {
    beforeEach(async () => {
        connection = await setUpTestConnection();
        setHeaders(connection, { res: { locals: {} } } as any);
    });
    afterEach(async () => {
        await connection.close();
    });
    describe('soft delete tests', () => {
        it('delete without criteria, should throw error', async () => {
            try {
                await connection.manager.delete('profile', {});
            } catch (e) {
                expect(e.message).toEqual('there are no entities to delete');
            }
        });
        it('parent is not common model, hard delete parent entity', async () => {
            Object.assign(connection.options, {
                extra: { config: { softDelete: { returnEntities: true } } },
            });
            await initDb(connection);
            const criteria = { relations: ['books'] };
            const lib = await connection.manager.findOne(Library, criteria);
            expect(lib).toBeDefined();
            await connection.manager.delete(Library, criteria);
            const libAfterDelete = await connection.manager.findOne(Library, criteria);
            expect(libAfterDelete).toBeUndefined();
        });

        it('field is not common model, does not delete linked entity', async () => {
            Object.assign(connection.options, {
                extra: { config: { softDelete: { returnEntities: true } } },
            });
            await initDb(connection);
            await connection.manager.delete(Author, authorWithCascadeCriteria);
            const lib = await connection.manager.findOne(Library, { relations: ['books'] });
            const authorWithCascade = await connection.manager.findOne(
                Author,
                authorWithCascadeCriteria,
            );
            lib ? expect(lib.deleted).toBeFalsy() : expect(lib).toBeDefined();
            authorWithCascade
                ? expect(authorWithCascade.getDeleted()).toBeTruthy()
                : expect(authorWithCascade).toBeDefined();
        });

        it('parent and field are common models but cascade is not on, does not delete linked entity', async () => {
            Object.assign(connection.options, {
                extra: { config: { softDelete: { returnEntities: true } } },
            });
            await initDb(connection);
            const criteria = { ...userCriteria, relations: ['profile'] };
            await connection.manager.delete(User, criteria);
            const userCommonModel = await connection.manager.findOne(User, criteria);
            userCommonModel
                ? expect(userCommonModel.getDeleted()).toBeTruthy()
                : expect(userCommonModel).toBeDefined();
            userCommonModel
                ? userCommonModel.profile
                    ? expect(userCommonModel.profile.getDeleted()).toBeFalsy()
                    : expect(userCommonModel.profile).toBeDefined()
                : expect(userCommonModel).toBeDefined();
        });

        it('field is common model and cascade is on, delete linked entity', async () => {
            Object.assign(connection.options, {
                extra: { config: { softDelete: { returnEntities: true } } },
            });
            await initDb(connection);
            await connection.manager.delete(Author, {
                ...authorWithCascadeCriteria,
                relations: ['books'],
            });
            const authorWithCascade: Author | undefined = await connection.manager.findOne(Author, {
                ...authorWithCascadeCriteria,
                relations: ['books'],
            });
            const bookWithCascade: Book | undefined = await connection.manager.findOne(
                Book,
                bookWithCascadeCriteria,
            );
            bookWithCascade
                ? expect(bookWithCascade.getDeleted()).toBeTruthy()
                : expect(bookWithCascade).toBeDefined();
            authorWithCascade
                ? expect(authorWithCascade.getDeleted()).toBeTruthy()
                : expect(bookWithCascade).toBeDefined();
        });
    });
    it('delete linked entity, should not return deleted entities(first level), get entity and its linked entity', async () => {
        await initDb(connection);
        await connection.manager.delete(Profile, profileCriteria);
        const userEntity: User | undefined = await connection.manager.findOne(User, {
            ...userCriteria,
            relations: ['profile'],
        });

        userEntity ? expect(userEntity.getDeleted()).toBeFalsy() : expect(userEntity).toBeDefined();
        if (userEntity) {
            userEntity.profile
                ? expect(userEntity.profile.getDeleted()).toBeTruthy()
                : expect(userEntity.profile).toBeDefined();
        }
    });

    // checks default setting
    it('delete entity, should not return deleted entities, doesnt return deleted entity', async () => {
        await initDb(connection);
        await connection.manager.delete(Book, testBookCriteria);
        const book: Book | undefined = await connection.manager.findOne(Book, testBookCriteria);
        expect(book).toBeUndefined();
    });

    // checks soft delete allow false
    it('delete entity, soft delete allow is false and return deleted entities true, doesnt return deleted entity', async () => {
        Object.assign(connection.options, {
            extra: { config: { softDelete: { returnEntities: true, allow: false } } },
        });
        await initDb(connection);
        await connection.manager.delete(Author, testAuthorCriteria);
        const author: Author | undefined = await connection.manager.findOne(
            Author,
            testAuthorCriteria,
        );
        expect(author).toBeUndefined();
    });

    // checks soft delete allow false with cascade
    it(
        'delete entity, soft delete allow is false and return deleted entities true and cascade is true,' +
            ' doesnt return deleted entity and its linked entity',
        async () => {
            Object.assign(connection.options, {
                extra: { config: { softDelete: { returnEntities: true, allow: false } } },
            });
            await initDb(connection);
            await connection.manager.delete(Author, authorWithCascadeCriteria);
            const bookWithCascade: Book | undefined = await connection.manager.findOne(
                Book,
                bookWithCascadeCriteria,
            );
            const authorWithCascade: Author | undefined = await connection.manager.findOne(
                Author,
                authorWithCascadeCriteria,
            );
            expect(bookWithCascade).toBeUndefined();
            expect(authorWithCascade).toBeUndefined();
        },
    );

    describe('data version tests', () => {
        it('books are created with data version, get all book for data version 0', async () => {
            await initDb(connection);
            if (connection.manager.queryRunner && connection.manager.queryRunner.data) {
                connection.manager.queryRunner.data = {
                    returnedExtensions: {},
                    requestHeaders: { dataVersion: 0 },
                };
            }
            const booksInit: Book[] = await connection.manager.find(Book);
            if (connection.manager.queryRunner && connection.manager.queryRunner.data) {
                connection.manager.queryRunner.data = {
                    returnedExtensions: {},
                    requestHeaders: { dataVersion: 2 },
                };
            }
            const booksAfterDataVersion: Book[] = await connection.manager.find(Book);
            expect(booksInit.length).toEqual(2);
            expect(booksAfterDataVersion.length).toEqual(0);
        });

        it('fail save action, data version not progressing', async () => {
            await initDb(connection);
            const bookFail = new Book('fail book');
            setHeaders(connection, { realityId: 1 });
            await connection.manager.save(Book, bookFail);
            const dv = await connection.manager.findOne(DataVersion);
            const bookSaved = await connection.manager.findOne(Book, {
                where: { title: bookFail.title },
            });
            dv ? expect(dv.getValue()).toEqual(1) : expect(dv).toBeUndefined();
            expect(bookSaved).toBeUndefined();
        });
    });

    describe('reality tests', () => {
        it('reality id is supplied in headers', async () => {
            await initDb(connection);
            const bookReality1: any = new Book('Jurassic Park');
            bookReality1.realityId = 1;
            setHeaders(connection, { realityId: 1 });
            await connection.manager.save(Book, bookReality1);
            setHeaders(connection, { realityId: 1 });
            const book: Book | undefined = await connection.manager.findOne(Book);
            expect(book).toEqual(bookReality1);
        });

        it('delete operational entity, linked oper header true and reality id isnt operational, entity not deleted', async () => {
            await initDb(connection);
            setHeaders(connection, { realityId: 1 });
            try {
                await connection.manager.delete(Author, testAuthorCriteria);
            } catch (err) {
                expect(err.message).toEqual('there are no entities to delete');
            }
        });

        it('save existing entity with different reality id, fail saving', async () => {
            await initDb(connection);
            const book: any = new Book('my book');
            await connection.getRepository(Book).save(book);
            book.realityId = 1;
            try {
                await connection.manager.save(Book, book);
            } catch (err) {
                expect(err.message).toEqual('reality id of entity is different from header');
            }
        });
    });
    it('find one with id', async () => {
        await initDb(connection);
        const book = new Book('my book');
        await connection.getRepository(Book).save(book);
        const bookFound: Book | undefined = await connection.manager.findOne(Book, {
            where: { id: book.getId() },
        });
        expect(book).toEqual(bookFound);
    });

    it('count', async () => {
        await initDb(connection);
        expect(await connection.manager.count(Book)).toEqual(2);
    });

    it('order by', async () => {
        await initDb(connection);
        const books1 = await connection.manager.find(Book, {
            order: {
                title: 'ASC',
            },
        });
        expect(books1[0].title).toEqual(cascadeBook);
        expect(books1[1].title).toEqual(harryPotter);
    });
});
