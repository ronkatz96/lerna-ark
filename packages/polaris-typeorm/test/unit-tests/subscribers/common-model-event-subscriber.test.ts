import { Connection, EntityManager, EntityMetadata, InsertEvent, QueryRunner, UpdateEvent } from 'typeorm';
// tslint:disable-next-line:no-submodule-imports
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
// tslint:disable-next-line:no-submodule-imports
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { CommonModel } from '../../../src';
import { CommonModelEventSubscriber } from '../../../src/subscribers/common-model-event-subscriber';
import { Book } from '../../dal/book';

let bookEntity: Book;
let commonModelEventSubscriber: CommonModelEventSubscriber;

describe('common model event subscriber tests', () => {
    beforeEach(async () => {
        bookEntity = new Book();
        commonModelEventSubscriber = new CommonModelEventSubscriber();
    });
    describe('beforeInsert tests', () => {
        it('all the common model fields defined as needed', async () => {
            const connection = getConnection();
            const event = new DummyInsertEvent(connection, bookEntity);
            Object.assign(connection.manager.connection, connection);
            await commonModelEventSubscriber.beforeInsert(event);
            expect(bookEntity.getCreationTime()).toBeDefined();
            expect(bookEntity.getLastUpdateTime()).toBeDefined();
        });
        it('without upn and with requesting system id', async () => {
            const connection = getConnection();
            const event = new DummyInsertEvent(connection, bookEntity);
            Object.assign(connection.manager.connection, connection);
            await commonModelEventSubscriber.beforeInsert(event);
            expect(bookEntity.getCreationTime()).toBeDefined();
            expect(bookEntity.getLastUpdateTime()).toBeDefined();
        });
        it('without reality id, so reality id is the default(which is 0)', async () => {
            const connection = getConnection();
            const event = new DummyInsertEvent(connection, bookEntity);
            Object.assign(connection.manager.connection, connection);
            await commonModelEventSubscriber.beforeInsert(event);
            expect(bookEntity.getCreationTime()).toBeDefined();
            expect(bookEntity.getLastUpdateTime()).toBeDefined();
        });
        it('check that the logger called as needed', async () => {
            const connection = getConnection();
            const event = new DummyInsertEvent(connection, bookEntity);
            await commonModelEventSubscriber.beforeInsert(event);
            expect(connection.logger.log).toBeCalledTimes(2);
        });
    });
    describe('beforeUpdate tests', () => {
        it('all the common model fields defined as needed', async () => {
            const connection = getConnection();
            const event = new DummyUpdateEvent(connection, bookEntity);
            await commonModelEventSubscriber.beforeUpdate(event);
            expect(bookEntity.getLastUpdateTime()).toBeDefined();
        });
        it('without upn and with requesting system id', async () => {
            const connection = getConnection();
            const event = new DummyUpdateEvent(connection, bookEntity);
            await commonModelEventSubscriber.beforeUpdate(event);
            expect(bookEntity.getLastUpdateTime()).toBeDefined();
        });
        it('without reality id, so reality id is the default(which is 0)', async () => {
            const connection = getConnection();
            const event = new DummyUpdateEvent(connection, bookEntity);
            Object.assign(connection.manager.connection, connection);
            await commonModelEventSubscriber.beforeUpdate(event);
            expect(bookEntity.getLastUpdateTime()).toBeDefined();
        });
        it('check that the logger called as needed', async () => {
            const connection = getConnection();
            const event = new DummyUpdateEvent(connection, bookEntity);
            await commonModelEventSubscriber.beforeUpdate(event);
            expect(connection.logger.log).toBeCalledTimes(2);
        });
    });
});

function getConnection(): any {
    return {
        manager: { connection: {} },
        logger: { log: jest.fn() },
    } as any;
}

class DummyInsertEvent implements InsertEvent<CommonModel> {
    public connection: Connection;
    public entity: CommonModel;
    public manager: EntityManager;
    public metadata: EntityMetadata;
    public queryRunner: QueryRunner;

    constructor(connection: Connection, entity: CommonModel) {
        this.connection = connection;
        this.entity = entity;
        this.manager = connection.manager;
    }
}

// tslint:disable-next-line:max-classes-per-file
class DummyUpdateEvent implements UpdateEvent<CommonModel> {
    public connection: Connection;
    public entity: CommonModel;
    public manager: EntityManager;
    public metadata: EntityMetadata;
    public queryRunner: QueryRunner;
    public databaseEntity: CommonModel;
    public updatedColumns: ColumnMetadata[];
    public updatedRelations: RelationMetadata[];

    constructor(connection: Connection, entity: CommonModel) {
        this.connection = connection;
        this.entity = entity;
        this.manager = connection.manager;
    }
}
