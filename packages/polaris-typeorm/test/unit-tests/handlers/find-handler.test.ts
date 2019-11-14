import { In } from 'typeorm';
import { FindHandler } from '../../../src/handlers/find-handler';

describe('find handler tests', () => {
    it('dataVersion property supplied in options or conditions and not in headers, get with data version condition', async () => {
        const connection = {
            manager: {
                queryRunner: { data: { requestHeaders: {} } },
            },
        } as any;
        const findHandler = new FindHandler(connection.manager);
        const find = findHandler.findConditions(true, { where: { dataVersion: 5 } });
        expect(find).toEqual({ where: { deleted: false, realityId: 0, dataVersion: 5 } });
    });

    it('realityId property supplied in options or conditions and not in the headers, get condition of given reality', async () => {
        const connection = {
            manager: {
                queryRunner: { data: { requestHeaders: {} } },
            },
        } as any;
        const findHandler = new FindHandler(connection.manager);
        const find = findHandler.findConditions(true, { where: { realityId: 3 } });
        expect(find).toEqual({ where: { deleted: false, realityId: 3 } });
    });

    it('include linked oper is true in headers, get realities of real and reality in headers', async () => {
        const connection = {
            manager: {
                queryRunner: {
                    data: { requestHeaders: { realityId: 1, includeLinkedOper: true } },
                },
            },
        } as any;
        const findHandler = new FindHandler(connection.manager);
        const find = findHandler.findConditions(true);
        expect(find).toEqual({ where: { deleted: false, realityId: In([1, 0]) } });
    });

    it('include linked oper is true in headers, get condition of default reality', async () => {
        const connection = {
            manager: {
                queryRunner: {
                    data: { requestHeaders: { realityId: 0, includeLinkedOper: true } },
                },
            },
        } as any;
        const findHandler = new FindHandler(connection.manager);
        const find = findHandler.findConditions(true);
        expect(find).toEqual({ where: { deleted: false, realityId: 0 } });
    });

    it('include linked oper is true in headers but false in find setting, get condition of reality in headers', async () => {
        const connection = {
            manager: {
                queryRunner: {
                    data: { requestHeaders: { realityId: 1, includeLinkedOper: true } },
                },
            },
        } as any;
        const findHandler = new FindHandler(connection.manager);
        const find = findHandler.findConditions(false);
        expect(find).toEqual({ where: { deleted: false, realityId: 1 } });
    });

    it('deleted property supplied in options or conditions, get condition of supplied setting', async () => {
        const connection = {
            manager: {
                queryRunner: { data: { requestHeaders: {} } },
            },
        } as any;
        const findHandler = new FindHandler(connection.manager);
        const find = findHandler.findConditions(true, { where: { deleted: true } });
        expect(find).toEqual({ where: { deleted: true, realityId: 0 } });
    });

    it('linked oper supplied in header property, supplied in options or conditions, get only from headers reality', async () => {
        const connection = {
            manager: {
                queryRunner: { data: { requestHeaders: { realityId: 1 } } },
            },
        } as any;
        const findHandler = new FindHandler(connection.manager);
        const find = findHandler.findConditions(true, { where: { includeLinkedOper: true } });
        expect(find).toEqual({ where: { deleted: false, realityId: 1, includeLinkedOper: true } });
    });
});
