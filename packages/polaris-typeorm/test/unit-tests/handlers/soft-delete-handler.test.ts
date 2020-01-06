import { CommonModel } from '../../../src';
import { PolarisCriteria } from '../../../src/contextable-options/polaris-criteria';
import { SoftDeleteHandler } from '../../../src/handlers/soft-delete-handler';
import { Book } from '../../dal/book';
import { Library } from '../../dal/library';

let connection: any;
let metadata: any;

describe('soft delete handler tests', () => {
    beforeEach(() => {
        metadata = {
            target: Library,
            inheritanceTree: [Library],
        } as any;
        metadata.relations = [
            {
                inverseEntityMetadata: {
                    targetName: Book,
                    foreignKeys: [
                        {
                            referencedEntityMetadata: metadata,
                        },
                    ],
                },
                propertyName: 'books',
            },
        ];
        const execute = jest.fn();
        execute
            .mockResolvedValueOnce({ affected: 1, raw: [{ id: 1 }] })
            .mockResolvedValueOnce({ affected: 0, raw: [] });
        const returningAndExecuteMock = jest.fn(() => {
            return {
                returning: jest.fn(() => {
                    return {
                        execute,
                    };
                }),
            };
        });
        connection = {
            manager: {
                queryRunner: { data: { requestHeaders: {} } },
                save: jest.fn(),
                connection: {
                    getMetadata: jest.fn(() => metadata),
                },
                createQueryBuilder: jest.fn(() => {
                    return {
                        update: jest.fn(() => {
                            return {
                                set: jest.fn(() => {
                                    return {
                                        where: jest.fn(returningAndExecuteMock),
                                        whereInIds: jest.fn(returningAndExecuteMock),
                                    };
                                }),
                            };
                        }),
                    };
                }),
            },
        } as any;
    });
    it('field is not common model, does not delete linked entity', async () => {
        metadata.relations[0].inverseEntityMetadata.inheritanceTree = [];
        metadata.relations[0].inverseEntityMetadata.foreignKeys[0].onDelete = 'CASCADE';
        const softDeleteHandler = new SoftDeleteHandler(connection.manager);
        const lib = new Library('library');
        await softDeleteHandler.softDeleteRecursive(Library, new PolarisCriteria(lib, {} as any));
        expect(connection.manager.createQueryBuilder).toBeCalledTimes(1);
    });
    it('field is common model and cascade is on, delete linked entity', async () => {
        metadata.relations[0].inverseEntityMetadata.inheritanceTree = [Book, CommonModel];
        metadata.relations[0].inverseEntityMetadata.foreignKeys[0].onDelete = 'CASCADE';
        const softDeleteHandler = new SoftDeleteHandler(connection.manager);
        const lib = new Library('library');
        await softDeleteHandler.softDeleteRecursive(Library, new PolarisCriteria(lib, {} as any));
        expect(connection.manager.createQueryBuilder).toBeCalledTimes(2);
    });
    it('field is common model but cascade is not on, does not delete linked entity', async () => {
        metadata.relations[0].inverseEntityMetadata.inheritanceTree = [Book, CommonModel];
        metadata.relations[0].inverseEntityMetadata.foreignKeys[0].onDelete = '';
        const softDeleteHandler = new SoftDeleteHandler(connection.manager);
        const lib = new Library('library');
        await softDeleteHandler.softDeleteRecursive(Library, new PolarisCriteria(lib, {} as any));
        expect(connection.manager.createQueryBuilder).toBeCalledTimes(1);
    });
});
