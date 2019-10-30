import {expect} from "chai";
import {Book} from "../dal/book";
import {
    rowling,
    mrCascade,
    harryPotter,
    cascadeBook,
    initDb,
    profile,
    setUpTestConnection,
    user, setContext, tearDownTestConnection
} from "../utils/set-up";
import {Author} from "../dal/author";
import {User} from "../dal/user";
import {Profile} from "../dal/profile";
import {Connection} from "typeorm";
import {DataVersion} from "../../src";

const testBookCriteria = {where: {title: harryPotter}};
const testAuthorCriteria = {where: {name: rowling}};

export const bookWithCascadeCriteria = {where: {title: cascadeBook}};
export const authorWithCascadeCriteria = {where: {name: mrCascade}};

export const userCriteria = {where: {name: user.name}};
const profileCriteria = {where: {gender: profile.gender}};

let connection: Connection;


describe('entity manager tests', async () => {
    beforeEach(async () => {
        connection = await setUpTestConnection();
    });
    afterEach(async () => {
        await tearDownTestConnection(connection);
        await connection.close();
    });
    describe('soft delete tests', () => {
        // checks default setting
        it('delete entity, recursive soft delete called', async () => {
            await initDb(connection);
            await connection.manager.delete(User, userCriteria);
            //todo: expect recursive soft delete to have been called
        });
        // checks default setting
        it('delete linked entity, should not return deleted entities(first level), get entity and its linked entity', async () => {
            await initDb(connection);
            await connection.manager.delete(Profile, profileCriteria);
            let user: User | undefined = await connection.manager.findOne(User, {
                ...userCriteria,
                relations: ["profile"]
            });
            user ? expect(user.deleted).to.be.false : expect(user).to.not.be.undefined;
            user ? user.profile ? expect(user.profile.deleted).to.be.true : expect(user.profile).to.not.be.undefined : {};
        });

        // checks default setting
        it('delete entity, should not return deleted entities, doesnt return deleted entity', async () => {
            await initDb(connection);
            await connection.manager.delete(Book, testBookCriteria);
            let book: Book | undefined = await connection.manager.findOne(Book, testBookCriteria);
            expect(book).to.be.undefined;
        });

        // checks soft delete allow false
        it('delete entity, soft delete allow is false and return deleted entities true, doesnt return deleted entity', async () => {
            // @ts-ignore
            connection.manager.config = {softDelete: {returnEntities: true, allow: false}};
            await initDb(connection);
            await connection.manager.delete(Author, testAuthorCriteria);
            let author: Author | undefined = await connection.manager.findOne(Author, testAuthorCriteria);
            expect(author).to.be.undefined;
        });

        // checks soft delete allow false with cascade
        it('delete entity, soft delete allow is false and return deleted entities true and cascade is true,' +
            ' doesnt return deleted entity and its linked entity', async () => {
            // @ts-ignore
            connection.manager.config = {softDelete: {returnEntities: true, allow: false}};
            await initDb(connection);
            await connection.manager.delete(Author, authorWithCascadeCriteria);
            let bookWithCascade: Book | undefined = await connection.manager.findOne(Book, bookWithCascadeCriteria);
            let authorWithCascade: Author | undefined = await connection.manager.findOne(Author, authorWithCascadeCriteria);
            expect(bookWithCascade).to.be.undefined;
            expect(authorWithCascade).to.be.undefined;
        });
    });

    describe('data version tests', async () => {

        it('books are created with data version, get all book for data version 0', async () => {
            await initDb(connection);
            connection.manager.queryRunner && connection.manager.queryRunner.data ?
                connection.manager.queryRunner.data = {context: {dataVersion: 0}} : {};
            let booksInit: Book[] = await connection.manager.find(Book, {});
            connection.manager.queryRunner && connection.manager.queryRunner.data ?
                connection.manager.queryRunner.data = {context: {dataVersion: 2}} : {};
            let booksAfterDataVersion: Book[] = await connection.manager.find(Book, {});
            expect(booksInit.length).to.equal(2);
            expect(booksAfterDataVersion.length).to.equal(0);
        });

        it('fail save action, data version not progressing', async () => {
            await initDb(connection);
            const bookFail = new Book('fail book');
            setContext(connection, {realityId: 1});
            await connection.manager.save(Book, bookFail);
            let dv = await connection.manager.findOne(DataVersion);
            let bookSaved = await connection.manager.findOne(Book, bookFail);
            dv ? expect(dv.value).to.equal(1) : expect(dv).to.not.be.undefined;
            expect(bookSaved).to.be.undefined;
        });
    });

    describe('reality tests', async () => {
        it('reality id is supplied in context', async () => {
            await initDb(connection);
            const bookReality1 = new Book('Jurassic Park');
            bookReality1.realityId = 1;
            setContext(connection, {realityId: 1});
            await connection.manager.save(Book, bookReality1);
            setContext(connection, {realityId: 1});
            let book: Book | undefined = await connection.manager.findOne(Book, {});
            expect(book).to.deep.equal(bookReality1);
        });

        it('delete operational entity, linked oper header true and reality id isnt operational, entity not deleted', async function () {
            await initDb(connection);
            setContext(connection, {realityId: 1});
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
    it('find one with id', async () => {
        await initDb(connection);
        const book = new Book('my book');
        await connection.getRepository(Book).save(book);
        let bookFound: Book | undefined = await connection.manager.findOne(Book, {where: {id: book.id}});
        expect(book).to.deep.equal(bookFound);
    });

    it('count', async () => {
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
        expect(books1[0].title).to.equal(cascadeBook);
        expect(books1[1].title).to.equal(harryPotter);
    });
});