import {DataVersionHandler} from "../../src/handlers/data-version-handler";
import {getContext, setContext, setUpTestConnection, tearDownTestConnection} from "../utils/set-up";
import {expect} from "chai";
import {Connection} from "typeorm";
import {DataVersion} from "../../src";

let connection: Connection;
let dataVersionHandler: DataVersionHandler;

describe('data version handler tests', async () => {
    beforeEach(async () => {
        connection = await setUpTestConnection();
        dataVersionHandler = new DataVersionHandler(connection.manager);
    });
    afterEach(async () => {
        await tearDownTestConnection(connection);
        await connection.close();
    });

    it('data version table empty, global data version in context and db created', async () => {
        await dataVersionHandler.updateDataVersion();
        let dv: DataVersion | undefined = await connection.manager.findOne(DataVersion, {});
        expect(dv).to.not.be.undefined;
        dv ? expect(dv.value).to.equal(1) : {};
    });

    it('no global data version in context but exist in db, data version incremented and saved to db and context', async () => {
        await connection.manager.save(DataVersion, new DataVersion(1));
        setContext(connection, {});
        await dataVersionHandler.updateDataVersion();
        let dv: DataVersion | undefined = await connection.manager.findOne(DataVersion, {});
        let c = getContext(connection);
        expect(c.globalDataVersion).to.equal(2);
        expect(dv).to.not.be.undefined;
        dv ? expect(dv.value).to.equal(2) : {};
    });
    it('global data version in context and not in db, throws error', async () => {
        setContext(connection, {globalDataVersion: 1});
        try {
            await dataVersionHandler.updateDataVersion();
        } catch (err) {
            expect(err.message).to.equal("data version in context even though the data version table is empty");
        }
    });
    it('global data version in context but does not equal to data version in db, throws error', async () => {
        await connection.manager.save(DataVersion, new DataVersion(1));
        setContext(connection, {globalDataVersion: 3});
        try {
            await dataVersionHandler.updateDataVersion();
        } catch (err) {
            expect(err.message).to.equal("data version in context does not equal data version in table");
        }
    });
    it('global data version in context and equal to data version in db, data version does not increment', async () => {
        await connection.manager.save(DataVersion, new DataVersion(1));
        setContext(connection, {globalDataVersion: 1});
        await dataVersionHandler.updateDataVersion();
        let dv = await connection.manager.findOne(DataVersion, {});
        expect(getContext(connection).globalDataVersion).to.equal(1);
        expect(dv).to.not.be.undefined;
        dv ? expect(dv.value).to.equal(1) : {};
    });
});