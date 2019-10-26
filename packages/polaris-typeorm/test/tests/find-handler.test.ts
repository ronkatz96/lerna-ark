import {FindHandler} from "../../src/handlers/find-handler";
import {expect} from "chai";
import {setContext, setUpTestConnection} from "../utils/set-up";
import {Connection} from "typeorm";

let connection: Connection;
let findHandler: FindHandler;

describe('find handler tests', async () => {
    beforeEach(async () => {
        connection = await setUpTestConnection();
        findHandler = new FindHandler(connection.manager);
    });
    afterEach(async () => {
        await connection.close();
    });

    it('dataVersion property supplied in options or conditions and not in context, get without data version condition', async () => {
        let find = findHandler.findConditions(true, {where: {dataVersion: 5}});
        expect(find).to.deep.equal({where: {deleted: false, realityId: 0}});
    });

    it('realityId property supplied in options or conditions and not in the context, get condition of default reality', async () => {
        let find = findHandler.findConditions(true, {where: {realityId: 3}});
        expect(find).to.deep.equal({where: {deleted: false, realityId: 0}});
    });

    it('include linked oper is true in context, get realities of real and reality in context', async () => {
        setContext(connection, {realityId: 1, includeLinkedOper: true});
        let find = findHandler.findConditions(true);
        expect(find).to.deep.equal({where: {deleted: false, realityId: [1, 0]}});
    });

    it('include linked oper is true in context, get condition of default reality', async () => {
        setContext(connection, {realityId: 0, includeLinkedOper: true});
        let find = findHandler.findConditions(true);
        expect(find).to.deep.equal({where: {deleted: false, realityId: 0}});
    });

    it('include linked oper is true in context but false in find setting, get condition of reality in context', async () => {
        setContext(connection, {realityId: 1, includeLinkedOper: true});
        let find = findHandler.findConditions(false);
        expect(find).to.deep.equal({where: {deleted: false, realityId: 1}});
    });

    it('deleted property supplied in options or conditions, get condition of default setting', async () => {
        let find = findHandler.findConditions(true, {where: {deleted: true}});
        expect(find).to.deep.equal({where: {deleted: false, realityId: 0}});
    });

    it('linked oper supplied in header property, supplied in options or conditions, get only from context reality', async () => {
        setContext(connection, {realityId: 1});
        let find = findHandler.findConditions(true, {where: {includeLinkedOper: true}});
        expect(find).to.deep.equal({where: {deleted: false, realityId: 1, includeLinkedOper: true}});
    });

    it('soft delete return entities is true, get condition without limitation on deleted', async () => {
        // @ts-ignore
        connection.manager.config = {softDelete: {returnEntities: true}};
        let find = findHandler.findConditions(false);
        expect(find).to.deep.equal({where: {realityId: 0}});
    });
});