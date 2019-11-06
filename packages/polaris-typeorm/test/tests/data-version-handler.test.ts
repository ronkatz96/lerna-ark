import { Connection } from 'typeorm';
import { DataVersion } from '../../src';
import { DataVersionHandler } from '../../src/handlers/data-version-handler';
import { getContext, setContext, setUpTestConnection } from '../utils/set-up';

let connection: Connection;
let dataVersionHandler: DataVersionHandler;

describe('data version handler tests', () => {
    beforeEach(async () => {
        connection = await setUpTestConnection();
        dataVersionHandler = new DataVersionHandler(connection.manager);
    });
    afterEach(async () => {
        await connection.close();
    });

    it('data version table empty, global data version in context and db created', async () => {
        await dataVersionHandler.updateDataVersion();
        const dv: DataVersion | undefined = await connection.manager.findOne(DataVersion);
        expect(dv).toBeDefined();
        if (dv) {
            expect(dv.getValue()).toEqual(1);
        }
    });

    it('no global data version in context but exist in db, data version incremented and saved to db and context', async () => {
        await connection.manager.save(DataVersion, new DataVersion(1));
        setContext(connection);
        await dataVersionHandler.updateDataVersion();
        const dv: DataVersion | undefined = await connection.manager.findOne(DataVersion);
        expect(getContext(connection).globalDataVersion).toEqual(2);
        expect(dv).toBeDefined();
        if (dv) {
            expect(dv.getValue()).toEqual(2);
        }
    });
    it('global data version in context and not in db, throws error', async () => {
        setContext(connection, { globalDataVersion: 1 });
        try {
            await dataVersionHandler.updateDataVersion();
        } catch (err) {
            expect(err.message).toEqual(
                'data version in context even though the data version table is empty',
            );
        }
    });
    it('global data version in context but does not equal to data version in db, throws error', async () => {
        await connection.manager.save(DataVersion, new DataVersion(1));
        setContext(connection, { globalDataVersion: 3 });
        try {
            await dataVersionHandler.updateDataVersion();
        } catch (err) {
            expect(err.message).toEqual(
                'data version in context does not equal data version in table',
            );
        }
    });
    it('global data version in context and equal to data version in db, data version does not increment', async () => {
        await connection.manager.save(DataVersion, new DataVersion(1));
        setContext(connection, { globalDataVersion: 1 });
        await dataVersionHandler.updateDataVersion();
        const dv = await connection.manager.findOne(DataVersion);
        expect(getContext(connection).globalDataVersion).toEqual(1);
        expect(dv).toBeDefined();
        if (dv) {
            expect(dv.getValue()).toEqual(1);
        }
    });
});
