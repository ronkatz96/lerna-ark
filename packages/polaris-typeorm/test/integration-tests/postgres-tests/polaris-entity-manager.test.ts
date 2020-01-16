import { Connection } from 'typeorm';
import { DataVersion, PolarisFindOneOptions, PolarisSaveOptions } from '../../../src';
import { PolarisCriteria } from '../../../src/contextable-options/polaris-criteria';
import { PolarisFindManyOptions } from '../../../src/contextable-options/polaris-find-many-options';
import { getAllEntitiesIncludingDeleted } from '../../../src/handlers/find-handler';
import { Author } from '../../dal/author';
import { Book } from '../../dal/book';
import { Library } from '../../dal/library';
import { Profile } from '../../dal/profile';
import { User } from '../../dal/user';
import {
    cascadeBook,
    generateContext,
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
        await initDb(connection);
        setHeaders(connection, { res: { locals: {} } } as any);
    });
    afterEach(async () => {
        await connection.close();
    });
    describe('soft delete tests', () => {
        it('parent is not common model, hard delete parent entity', async () => {
            const criteria = { where: { name: 'public' } };
            const lib = await connection.manager.findOne(
                Library,
                new PolarisFindOneOptions(criteria, generateContext()) as any,
            );
            expect(lib).toBeDefined();
            await connection.manager.delete(
                Library,
                new PolarisCriteria(criteria, generateContext()),
            );
            const libAfterDelete = await connection.manager.findOne(
                Library,
                new PolarisFindOneOptions(criteria, generateContext()) as any,
            );
            expect(libAfterDelete).toBeUndefined();
        });

        it('field is not common model, does not delete linked entity', async () => {
            await connection.manager.delete(
                Author,
                new PolarisCriteria(authorWithCascadeCriteria, generateContext() as any),
            );
            const lib = await connection.manager.findOne(
                Library,
                new PolarisFindOneOptions({ relations: ['books'] }, generateContext()) as any,
            );
            const criteria = {
                where: {
                    ...authorWithCascadeCriteria.where,
                    ...getAllEntitiesIncludingDeleted.where,
                },
            };
            const authorWithCascade = await connection.manager.findOne(
                Author,
                new PolarisFindOneOptions(criteria, generateContext()) as any,
            );
            expect(lib).toBeDefined();
            authorWithCascade
                ? expect(authorWithCascade.getDeleted()).toBeTruthy()
                : expect(authorWithCascade).toBeDefined();
        });

        it('parent and field are common models but cascade is not on, does not delete linked entity', async () => {
            const criteria = {
                where: { ...userCriteria.where, ...getAllEntitiesIncludingDeleted.where },
                relations: ['profile'],
            };
            await connection.manager.delete(
                User,
                new PolarisCriteria(userCriteria, generateContext()),
            );
            const userCommonModel = await connection.manager.findOne(
                User,
                new PolarisFindOneOptions(criteria, generateContext()) as any,
            );
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
            const criteria = {
                where: {
                    ...authorWithCascadeCriteria.where,
                    ...getAllEntitiesIncludingDeleted.where,
                },
                relations: ['books'],
            };
            const bookCriteria = {
                where: {
                    ...bookWithCascadeCriteria.where,
                    ...getAllEntitiesIncludingDeleted.where,
                },
            };
            await connection.manager.delete(
                Author,
                new PolarisCriteria(authorWithCascadeCriteria, generateContext()) as any,
            );
            const authorWithCascade: Author | undefined = await connection.manager.findOne(
                Author,
                new PolarisFindOneOptions(criteria, generateContext()) as any,
            );
            const bookWithCascade: Book | undefined = await connection.manager.findOne(
                Book,
                new PolarisFindOneOptions(bookCriteria, generateContext()) as any,
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
        await connection.manager.delete(
            Profile,
            new PolarisCriteria(profileCriteria, generateContext()),
        );
        const userEntity: User | undefined = await connection.manager.findOne(
            User,
            new PolarisFindOneOptions(
                {
                    ...userCriteria,
                    relations: ['profile'],
                },
                generateContext(),
            ) as any,
        );

        userEntity ? expect(userEntity.getDeleted()).toBeFalsy() : expect(userEntity).toBeDefined();
        if (userEntity) {
            userEntity.profile
                ? expect(userEntity.profile.getDeleted()).toBeTruthy()
                : expect(userEntity.profile).toBeDefined();
        }
    });

    // checks default setting
    it('delete entity, should not return deleted entities, doesnt return deleted entity', async () => {
        await connection.manager.delete(
            Book,
            new PolarisCriteria(testBookCriteria, generateContext()),
        );
        const book: Book | undefined = await connection.manager.findOne(
            Book,
            new PolarisFindOneOptions(testBookCriteria, generateContext()) as any,
        );
        expect(book).toBeUndefined();
    });

    // checks soft delete allow false
    it('delete entity, soft delete allow is false and return deleted entities true, doesnt return deleted entity', async () => {
        Object.assign(connection.options, {
            extra: { config: { allowSoftDelete: false } },
        });
        await connection.manager.delete(
            Author,
            new PolarisCriteria(testAuthorCriteria, generateContext()),
        );
        const author: Author | undefined = await connection.manager.findOne(
            Author,
            new PolarisFindOneOptions(
                {
                    where: { ...testAuthorCriteria.where, ...getAllEntitiesIncludingDeleted.where },
                },
                generateContext(),
            ) as any,
        );
        expect(author).toBeUndefined();
    });

    // checks soft delete allow false with cascade
    it(
        'delete entity, soft delete allow is false and return deleted entities true and cascade is true,' +
            ' doesnt return deleted entity and its linked entity',
        async () => {
            Object.assign(connection.options, {
                extra: { config: { allowSoftDelete: false } },
            });
            await connection.manager.delete(
                Author,
                new PolarisCriteria(authorWithCascadeCriteria, generateContext()),
            );
            const bookWithCascade: Book | undefined = await connection.manager.findOne(
                Book,
                new PolarisFindOneOptions(
                    {
                        where: {
                            ...bookWithCascadeCriteria.where,
                            ...getAllEntitiesIncludingDeleted.where,
                        },
                    },
                    generateContext(),
                ) as any,
            );
            const authorWithCascade: Author | undefined = await connection.manager.findOne(
                Author,
                new PolarisFindOneOptions(
                    {
                        where: {
                            ...authorWithCascadeCriteria.where,
                            ...getAllEntitiesIncludingDeleted.where,
                        },
                    },
                    generateContext(),
                ) as any,
            );
            expect(bookWithCascade).toBeUndefined();
            expect(authorWithCascade).toBeUndefined();
        },
    );

    describe('data version tests', () => {
        it('books are created with data version, get all book for data version 0', async () => {
            const booksInit: Book[] = await connection.manager.find(
                Book,
                new PolarisFindManyOptions({}, generateContext({ dataVersion: 0 })) as any,
            );
            const booksAfterDataVersion: Book[] = await connection.manager.find(
                Book,
                new PolarisFindManyOptions({}, generateContext({ dataVersion: 2 })) as any,
            );
            expect(booksInit.length).toEqual(2);
            expect(booksAfterDataVersion.length).toEqual(0);
        });

        it('fail save action, data version not progressing', async () => {
            const bookFail = new Book('fail book');
            await connection.manager.save(Book, bookFail);
            const dv = await connection.manager.findOne(DataVersion);
            const bookSaved = await connection.manager.findOne(
                Book,
                new PolarisFindOneOptions(
                    {
                        where: { title: bookFail.title },
                    },
                    generateContext({ realityId: 1 }),
                ) as any,
            );
            dv ? expect(dv.getValue()).toEqual(1) : expect(dv).toBeUndefined();
            expect(bookSaved).toBeUndefined();
        });
    });

    describe('reality tests', () => {
        it('reality id is supplied in headers', async () => {
            const bookReality1: any = new Book('Jurassic Park');
            bookReality1.realityId = 1;
            await connection.manager.save(
                Book,
                new PolarisSaveOptions(bookReality1, generateContext({ realityId: 1 })) as any,
            );
            const book: Book | undefined = await connection.manager.findOne(
                Book,
                new PolarisFindOneOptions({}, generateContext({ realityId: 1 })) as any,
            );
            expect(book).toEqual(bookReality1);
        });

        it('delete operational entity, linked oper header true and reality id isnt operational, entity not deleted', async () => {
            try {
                await connection.manager.delete(
                    Author,
                    new PolarisCriteria(testAuthorCriteria, generateContext({ realityId: 1 })),
                );
            } catch (err) {
                expect(err.message).toEqual('there are no entities to delete');
            }
        });

        it('save existing entity with different reality id, fail saving', async () => {
            const book: any = new Book('my book');
            await connection
                .getRepository(Book)
                .save(new PolarisSaveOptions(book, generateContext()) as any);
            book.realityId = 1;
            try {
                await connection.manager.save(
                    Book,
                    new PolarisSaveOptions(book, generateContext({ realityId: 1 })) as any,
                );
            } catch (err) {
                expect(err.message).toEqual('reality id of entity is different from header');
            }
        });
    });
    it('find one with id', async () => {
        const book = new Book('my book');
        await connection
            .getRepository(Book)
            .save(new PolarisSaveOptions(book, generateContext()) as any);
        const bookFound: Book | undefined = await connection.manager.findOne(
            Book,
            new PolarisFindOneOptions(
                {
                    where: { id: book.getId() },
                },
                generateContext(),
            ) as any,
        );
        expect(book).toEqual(bookFound);
    });

    it('count', async () => {
        expect(
            await connection.manager.count(
                Book,
                new PolarisFindManyOptions({}, generateContext()) as any,
            ),
        ).toEqual(2);
    });

    it('order by', async () => {
        const books1 = await connection.manager.find(
            Book,
            new PolarisFindManyOptions(
                {
                    order: {
                        title: 'ASC',
                    },
                },
                generateContext(),
            ) as any,
        );
        expect(books1[0].title).toEqual(cascadeBook);
        expect(books1[1].title).toEqual(harryPotter);
    });
});
