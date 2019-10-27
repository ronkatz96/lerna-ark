import {SoftDeleteHandler} from "../../src/handlers/soft-delete-handler";
import {Library} from "../dal/library";
import {initDb, setUpTestConnection} from "../utils/set-up";
import {Connection} from "typeorm";
import {Book} from "../dal/book";
import {Author} from "../dal/author";
import {expect} from "chai";
import {authorWithCascadeCriteria, bookWithCascadeCriteria, userCriteria} from "./polaris-entity-manager.test";
import {User} from "../dal/user";

let connection: Connection;
let softDeleteHandler: SoftDeleteHandler;
describe('soft delete handler tests', async () => {

    beforeEach(async () => {
        connection = await setUpTestConnection();
        softDeleteHandler = new SoftDeleteHandler(connection.manager);
    });
    afterEach(async () => {
        await connection.close();
    });

    it('parent is not common model, soft delete parent entity, does not delete linked entity', async () => {
        // @ts-ignore
        connection.manager.config = {softDelete: {returnEntities: true}};
        await initDb(connection);
        let lib = await connection.manager.findOne(Library, {relations: ["books"]});
        await softDeleteHandler.softDeleteRecursive(Library, lib);
        let bookWithCascade: Book | undefined = await connection.manager.findOne(Book, bookWithCascadeCriteria);
        lib ? expect(lib.deleted).to.be.true : expect(lib).to.not.be.undefined;
        bookWithCascade ? expect(bookWithCascade.deleted).to.be.false : expect(bookWithCascade).to.not.be.undefined;
    });

    it('field is not common model, does not delete linked entity', async () => {
        // @ts-ignore
        connection.manager.config = {softDelete: {returnEntities: true}};
        await initDb(connection);
        let lib = await connection.manager.findOne(Library, {relations: ["books"]});
        let authorWithCascade = await connection.manager.findOne(Author, authorWithCascadeCriteria);
        await softDeleteHandler.softDeleteRecursive(Author, authorWithCascade);
        lib ? expect(lib.deleted).to.be.false : expect(lib).to.not.be.undefined;
        authorWithCascade ? expect(authorWithCascade.deleted).to.be.true : expect(authorWithCascade).to.not.be.undefined;
    });

    it('parent and field are common models but cascade is not on, does not delete linked entity', async () => {
        // @ts-ignore
        connection.manager.config = {softDelete: {returnEntities: true}};
        await initDb(connection);
        let user: User | undefined = await connection.manager.findOne(User, {
            where: userCriteria,
            relations: ["profile"]
        });
        await softDeleteHandler.softDeleteRecursive(User, user);
        user ? expect(user.deleted).to.be.true : expect(user).to.not.be.undefined;
        user ? user.profile ? expect(user.profile.deleted).to.be.false :
            expect(user.profile).to.not.be.undefined : expect(user).to.not.be.undefined;
    });

    it('field is common model and cascade is on, delete linked entity', async () => {
        // @ts-ignore
        connection.manager.config = {softDelete: {returnEntities: true}};
        await initDb(connection);
        let authorWithCascade: Author | undefined = await connection.manager.findOne(Author, {
            where: authorWithCascadeCriteria,
            relations: ["books"]
        });
        await softDeleteHandler.softDeleteRecursive(Author, authorWithCascade);
        let bookWithCascade: Book | undefined = await connection.manager.findOne(Book, bookWithCascadeCriteria);
        bookWithCascade ? expect(bookWithCascade.deleted).to.be.true : expect(bookWithCascade).to.not.be.undefined;
        authorWithCascade ? expect(authorWithCascade.deleted).to.be.true : expect(bookWithCascade).to.not.be.undefined;
    });
})
;