import {expect} from "chai";
import {Book} from "../dal/book";
import {
    authorName1,
    authorName2,
    bookName1,
    bookName2,
    initDb,
    profile,
    setUpTestConnection,
    user
} from "../utils/set-up";
import {Author} from "../dal/author";
import {User} from "../dal/user";
import {Profile} from "../dal/profile";
import {DataVersion} from "../../src/models/data-version";

const testBookCriteria = {where: {title: bookName1}};
const testAuthorCriteria = {where: {name: authorName1}};

const bookWithCascadeCriteria = {where: {title: bookName2}};
const authorWithCascadeCriteria = {where: {name: authorName2}};

const userCriteria = {where: {name: user.name}};
const profileCriteria = {where: {gender: profile.gender}};

let connection;

describe('entity manager tests', async () => {
    beforeEach(async () => {
        connection = await setUpTestConnection();
    });
    afterEach(async () => {
        await connection.close();
    });
    describe('soft delete tests', () => {
        it('delete entity, return deleted entities is true, get entity that is deleted', async () => {
            connection.manager.config = {softDelete: {returnEntities: true}};
            await initDb(connection);
            await connection.manager.delete(Book, testBookCriteria);
            let book: Book = await connection.manager.findOne(Book, testBookCriteria);
            expect(book.deleted).to.be.true;
        });

        it('delete entity, return deleted entities is true, check that linked entity was not deleted', async () => {
            connection.manager.config = {softDelete: {returnEntities: true}};
            await initDb(connection);
            await connection.manager.delete(User, userCriteria);
            let user: User = await connection.manager.findOne(User, {
                where: userCriteria,
                relations: ["profile"]
            });
            expect(user.profile.deleted).to.be.false;
        });

        it('delete linked entity, should not return deleted entities(first level), get entity and its linked entity', async () => {
            await initDb(connection);
            await connection.manager.delete(Profile, profileCriteria);
            let user: User = await connection.manager.findOne(User, {
                where: userCriteria,
                relations: ["profile"]
            });
            expect(user.deleted).to.be.false;
            expect(user.profile.deleted).to.be.true;
        });

        it('delete entity, should not return deleted entities, doesnt return deleted entity', async () => {
            await initDb(connection);
            await connection.manager.delete(Book, testBookCriteria);
            let book: Book = await connection.manager.findOne(Book, testBookCriteria);
            expect(book).to.be.undefined;
        });

        it('delete entity, soft delete allow is false and return deleted entities true, doesnt return deleted entity', async () => {
            connection.manager.config = {softDelete: {returnEntities: true, allow: false}};
            await initDb(connection);
            await connection.manager.delete(Author, testAuthorCriteria);
            let author: Author = await connection.manager.findOne(Author, testAuthorCriteria);
            expect(author).to.be.undefined;
        });

        xit('delete entity, soft delete allow is false and return deleted entities true and cascade is true,' +
            ' doesnt return deleted entity and its linked entity', async () => {
            connection.manager.config = {softDelete: {returnEntities: true, allow: false}};
            await initDb(connection);
            await connection.manager.delete(Book, bookWithCascadeCriteria);
            let bookWithCascade: Book = await connection.manager.findOne(Book, bookWithCascadeCriteria);
            let authorWithCascade: Author = await connection.manager.findOne(Author, authorWithCascadeCriteria);
            expect(bookWithCascade).to.be.undefined;
            expect(authorWithCascade).to.be.undefined;
        });

        xit('delete entity, soft delete and return deleted entities true and cascade is true,' +
            ' entity and its linked entity are deleted', async () => {
            connection.manager.config = {softDelete: {returnEntities: true}};
            await initDb(connection);
            await connection.manager.delete(Author, authorWithCascadeCriteria);
            let bookWithCascade: Book = await connection.manager.findOne(Book, bookWithCascadeCriteria);
            let authorWithCascade: Author = await connection.manager.findOne(Author, authorWithCascadeCriteria);
            expect(bookWithCascade.deleted).to.be.true;
            expect(authorWithCascade.deleted).to.be.true;
        });
    });

    describe('data version tests', async () => {
        it('books are created with data version, get all book for data version 0', async () => {
            await initDb(connection);
            connection.manager.queryRunner.data = {context: {dataVersion: 0}};
            let booksInit: Book[] = await connection.manager.find(Book, {});
            connection.manager.queryRunner.data = {context: {dataVersion: 2}};
            let booksAfterDataVersion: Book[] = await connection.manager.find(Book, {});
            expect(booksInit.length).to.equal(2);
            expect(booksAfterDataVersion.length).to.equal(0);
        });
        it('fail save action, data version not progressing', async () => {
            await initDb(connection);
            const bookFail = new Book('fail book');
            connection.manager.queryRunner.data = {context: {realityId: 1}};
            await connection.manager.save(Book, bookFail);
            let dv = await connection.manager.findOne(DataVersion);
            let bookSaved = await connection.manager.findOne(Book, bookFail);
            expect(dv.value).to.equal(1);
            expect(bookSaved).to.equal(undefined);
        });
    });

    describe('reality tests', async () => {
        it('reality id is supplied in context', async () => {
            await initDb(connection);
            const bookReality1 = new Book('Jurassic Park');
            bookReality1.realityId = 1;
            connection.manager.queryRunner.data = {context: {realityId: 1}};
            await connection.manager.save(Book, bookReality1);
            connection.manager.queryRunner.data = {context: {realityId: 1}};
            let book: Book = await connection.manager.findOne(Book, {});
            expect(book).to.deep.equal(bookReality1);
        });

        it('delete operational entity, linked oper header true and reality id isnt operational, entity not deleted', async function () {
            await initDb(connection);
            connection.manager.queryRunner.data = {context: {realityId: 1}};
            try {
                await connection.manager.delete(Author, testAuthorCriteria);
            } catch (err) {
                expect(err.message).to.equal('there are no entities to delete');
            }
        });

        it('save existing entity with different reality id, fail saving', async () => {
            await initDb(connection);
            const book = new Book('my book');
            await connection.getRepository(Book).save(book);
            book.realityId = 1;
            try {
                await connection.manager.save(Book, book);
            } catch (err) {
                expect(err.message).to.equal('reality id of entity is different from header');
            }
        });
    });
    it('find one with id, act as expected', async () => {
        await initDb(connection);
        const book = new Book('my book');
        await connection.getRepository(Book).save(book);
        let bookFound: Book = await connection.manager.findOne(Book, {where: {id: book.id}});
        expect(book).to.deep.equal(bookFound);
    });

    describe('works as expected tests', () => {
        it('count, act as expected', async () => {
            await initDb(connection);
            expect(await connection.manager.count(Book)).to.equal(2);
        });

        it('order by', async () => {
            await initDb(connection);
            let books1 = await connection.manager.find(Book, {
                order: {
                    title: "ASC"
                }
            });
            expect(books1[0].title).to.equal(bookName2);
            expect(books1[1].title).to.equal(bookName1);
        });
    });
});