import { Connection } from 'typeorm';
import { SoftDeleteHandler } from '../../src/handlers/soft-delete-handler';
import { Author } from '../dal/author';
import { Book } from '../dal/book';
import { Library } from '../dal/library';
import { User } from '../dal/user';
import { initDb, setUpTestConnection } from '../utils/set-up';
import {
    authorWithCascadeCriteria,
    bookWithCascadeCriteria,
    userCriteria,
} from './polaris-entity-manager.test';

let connection: Connection;
let softDeleteHandler: SoftDeleteHandler;
describe('soft delete handler tests', () => {
    beforeEach(async () => {
        connection = await setUpTestConnection();
        softDeleteHandler = new SoftDeleteHandler(connection.manager);
    });
    afterEach(async () => {
        await connection.close();
    });

    it('parent is not common model, soft delete parent entity, does not delete linked entity', async () => {
        Object.assign(connection.manager, 'config', { softDelete: { returnEntities: true } });
        await initDb(connection);
        const lib = await connection.manager.findOne(Library, { relations: ['books'] });
        await softDeleteHandler.softDeleteRecursive(Library, lib);
        const bookWithCascade: Book | undefined = await connection.manager.findOne(
            Book,
            bookWithCascadeCriteria,
        );
        lib ? expect(lib.deleted).toBeTruthy() : expect(lib).toBeUndefined();
        bookWithCascade
            ? expect(bookWithCascade.getDeleted()).toBeFalsy()
            : expect(bookWithCascade).toBeDefined();
    });

    it('field is not common model, does not delete linked entity', async () => {
        Object.assign(connection.manager, 'config', { softDelete: { returnEntities: true } });
        await initDb(connection);
        const lib = await connection.manager.findOne(Library, { relations: ['books'] });
        const authorWithCascade = await connection.manager.findOne(
            Author,
            authorWithCascadeCriteria,
        );
        await softDeleteHandler.softDeleteRecursive(Author, authorWithCascade);
        lib ? expect(lib.deleted).toBeFalsy() : expect(lib).toBeDefined();
        authorWithCascade
            ? expect(authorWithCascade.getDeleted()).toBeTruthy()
            : expect(authorWithCascade).toBeDefined();
    });

    it('parent and field are common models but cascade is not on, does not delete linked entity', async () => {
        Object.assign(connection.manager, 'config', { softDelete: { returnEntities: true } });
        await initDb(connection);
        const user: User | undefined = await connection.manager.findOne(User, {
            ...userCriteria,
            relations: ['profile'],
        });
        await softDeleteHandler.softDeleteRecursive(User, user);
        user ? expect(user.getDeleted()).toBeTruthy() : expect(user).toBeDefined();
        user
            ? user.profile
                ? expect(user.profile.getDeleted()).toBeFalsy()
                : expect(user.profile).toBeDefined()
            : expect(user).toBeDefined();
    });

    it('field is common model and cascade is on, delete linked entity', async () => {
        Object.assign(connection.options, {
            extra: { config: { softDelete: { returnEntities: true } } },
        });
        await initDb(connection);
        const authorWithCascade: Author | undefined = await connection.manager.findOne(Author, {
            ...authorWithCascadeCriteria,
            relations: ['books'],
        });
        await softDeleteHandler.softDeleteRecursive(Author, authorWithCascade);
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
