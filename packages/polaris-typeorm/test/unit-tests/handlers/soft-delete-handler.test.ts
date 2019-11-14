import { CommonModel } from '../../../src';
import { SoftDeleteHandler } from '../../../src/handlers/soft-delete-handler';
import { Author } from '../../dal/author';
import { Book } from '../../dal/book';
import { Library } from '../../dal/library';

describe('soft delete handler tests', () => {
    it('parent is not common model, soft delete parent entity, does not delete linked entity', async () => {
        const connection = {
            manager: {
                queryRunner: { data: { requestHeaders: {} } },
                save: jest.fn(),
                connection: {
                    entityMetadatas: [{ target: Library, inheritanceTree: [Library] }],
                },
            },
        } as any;
        const softDeleteHandler = new SoftDeleteHandler(connection.manager);
        const lib = new Library('library');
        await softDeleteHandler.softDeleteRecursive(Library, lib);
        expect(lib.deleted).toBeTruthy();
        expect(connection.manager.save).toBeCalledWith(Library, [lib]);
    });

    it('field is not common model, does not delete linked entity', async () => {
        const connection = {
            manager: {
                queryRunner: { data: { requestHeaders: {} } },
                save: jest.fn(),
                connection: {
                    entityMetadatas: [
                        {
                            target: Author,
                            inheritanceTree: [CommonModel, Author],
                        },
                    ],
                },
            },
        } as any;
        connection.manager.connection.entityMetadatas[0].relations = [
            {
                inverseEntityMetadata: {
                    inheritanceTree: [Library],
                    foreignKeys: {
                        onDelete: 'CASCADE',
                        referencedEntityMetadata: connection.manager.connection.entityMetadatas[0],
                    },
                },
            },
        ];
        const softDeleteHandler = new SoftDeleteHandler(connection.manager);
        const library = new Library('library');
        const author = new Author('author');
        author.libraries = [library];
        await softDeleteHandler.softDeleteRecursive(Author, author);
        expect(library.deleted).toBeFalsy();
        expect(author.getDeleted()).toBeTruthy();
        expect(connection.manager.save).toBeCalledTimes(1);
        expect(connection.manager.save).toBeCalledWith(Author, [author]);
    });
    it('parent and field are common models but cascade is not on, does not delete linked entity', async () => {
        const connection = {
            manager: {
                queryRunner: { data: { requestHeaders: {} } },
                save: jest.fn(),
                connection: {
                    entityMetadatas: [
                        {
                            target: Author,
                            inheritanceTree: [CommonModel, Author],
                        },
                    ],
                },
            },
        } as any;
        connection.manager.connection.entityMetadatas[0].relations = [
            {
                inverseEntityMetadata: {
                    inheritanceTree: [Book],
                    foreignKeys: {
                        onDelete: '',
                        referencedEntityMetadata: connection.manager.connection.entityMetadatas[0],
                    },
                },
            },
        ];
        const softDeleteHandler = new SoftDeleteHandler(connection.manager);
        const book = new Book('book');
        const author = new Author('author', [book]);
        book.author = author;
        await softDeleteHandler.softDeleteRecursive(Author, author);
        expect(book.getDeleted()).toBeFalsy();
        expect(author.getDeleted()).toBeTruthy();
        expect(connection.manager.save).toBeCalledTimes(1);
        expect(connection.manager.save).toBeCalledWith(Author, [author]);
    });

    it('field is common model and cascade is on, delete linked entity', async () => {
        const connection = {
            manager: {
                queryRunner: { data: { requestHeaders: {} } },
                save: jest.fn(),
                connection: {
                    entityMetadatas: [
                        {
                            target: Author,
                            inheritanceTree: [CommonModel, Author],
                        },
                    ],
                },
            },
        } as any;
        connection.manager.connection.entityMetadatas[0].relations = [
            {
                inverseEntityMetadata: {
                    target: Book,
                    inheritanceTree: [CommonModel, Book],
                    foreignKeys: [
                        {
                            onDelete: 'CASCADE',
                            referencedEntityMetadata:
                                connection.manager.connection.entityMetadatas[0],
                        },
                    ],
                    relations: [{ inverseSidePropertyPath: 'books' }],
                },
            },
        ];
        const softDeleteHandler = new SoftDeleteHandler(connection.manager);
        const book = new Book('book');
        const author = new Author('author', [book]);
        book.author = author;
        await softDeleteHandler.softDeleteRecursive(Author, author);
        expect(book.getDeleted()).toBeTruthy();
        expect(author.getDeleted()).toBeTruthy();
        expect(connection.manager.save).toBeCalledTimes(2);
        expect(connection.manager.save.mock.calls).toEqual([[Book, [book]], [Author, [author]]]);
    });
});
