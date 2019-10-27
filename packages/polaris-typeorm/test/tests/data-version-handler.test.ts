import {DataVersionHandler} from "../../src/handlers/data-version-handler";
import {setUpTestConnection} from "../utils/set-up";
import {expect} from "chai";
import {DataVersion} from "../../src/models/data-version";

let connection;
let dataVersionHandler;

describe('data version handler tests', async () => {
    beforeEach(async () => {
        connection = await setUpTestConnection();
        dataVersionHandler = new DataVersionHandler(connection.manager);
    });
    afterEach(async () => {
        await connection.close();
    });
    
    it('data version table empty, global data version in context and db created', async () => {
        // @ts-ignore
        await dataVersionHandler.updateDataVersion();
        let dv = await connection.manager.findOne(DataVersion, {});
        expect(dv.value).to.equal(1);
    });

    it('no global data version in context but exist in db, data version incremented and saved to db and context', async () => {
        // @ts-ignore
        await connection.manager.save(DataVersion, new DataVersion(1));
        connection.manager.queryRunner.data.context = {};
        await dataVersionHandler.updateDataVersion();
        let dv = await connection.manager.findOne(DataVersion, {});
        expect(connection.manager.queryRunner.data.context.globalDataVersion).to.equal(2);
        expect(dv.value).to.equal(2);
    });
    it('global data version in context and not in db, throws error', async () => {
        // @ts-ignore
        connection.manager.queryRunner.data.context = {globalDataVersion: 1};
        try {
            await dataVersionHandler.updateDataVersion();
        } catch (err) {
            expect(err.message).to.equal("data version in context even though the data version table is empty");
        }
    });
    it('global data version in context but does not equal to data version in db, throws error', async () => {
        // @ts-ignore
        await connection.manager.save(DataVersion, new DataVersion(1));
        connection.manager.queryRunner.data.context = {globalDataVersion:3};
        try {
            await dataVersionHandler.updateDataVersion();
        } catch (err) {
            expect(err.message).to.equal("data version in context does not equal data version in table");
        }
    });
    it('global data version in context and equal to data version in db, data version does not increment', async () => {
        await connection.manager.save(DataVersion, new DataVersion(1));
        connection.manager.queryRunner.data.context = {globalDataVersion:1};
        await dataVersionHandler.updateDataVersion();
        let dv = await connection.manager.findOne(DataVersion, {});
        expect(connection.manager.queryRunner.data.context.globalDataVersion).to.equal(1);
        expect(dv.value).to.equal(1);
    });
});