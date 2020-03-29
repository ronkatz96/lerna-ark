import { PolarisConnection, PolarisRepository, SnapshotPage } from '../../../src';
import { setUpTestConnection } from '../utils/set-up';

describe('snapshot page tests', () => {
    let connection: PolarisConnection;
    let snapshotRepo: PolarisRepository<SnapshotPage>;

    beforeEach(async () => {
        connection = await setUpTestConnection();
        snapshotRepo = connection.getRepository(SnapshotPage);
    });

    afterEach(async () => {
        await connection.close();
    });

    test('saving snapshot with data, snapshot is saved with requested data', async () => {
        const data: string = 'foo';
        const snapshotPage: SnapshotPage = new SnapshotPage(data);
        await snapshotRepo.save({} as any, snapshotPage);
        const page: SnapshotPage | undefined = await snapshotRepo.findOne(
            {} as any,
            snapshotPage.getId(),
        );
        expect(page).toBeDefined();
        expect(page).not.toBeNull();
        expect(page!.getData()).toBe(data);
    });
});
