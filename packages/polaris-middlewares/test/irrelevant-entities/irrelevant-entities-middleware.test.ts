import { IrrelevantEntitiesMiddleware } from '../../src';

const result = [{ id: '1' }, { id: '3' }, { id: '5' }];
const irrResult = [{ id: '2' }, { id: '4' }, { id: '6' }];
const bookRepo = {
    find: jest.fn(() => irrResult),
} as any;
const connection = { getRepository: jest.fn(() => bookRepo) } as any;
const logger = { debug: jest.fn() } as any;
const irrelevantEntitiesMiddleware = new IrrelevantEntitiesMiddleware(
    logger,
    connection,
).getMiddleware();

const polarisTypeORMModule = require('@enigmatis/polaris-typeorm');
polarisTypeORMModule.getConnectionManager = jest.fn(() => {
    return { get: jest.fn(() => connection), connections: [connection] };
});

describe('Irrelevant entities middleware', () => {
    describe('irrelevant entities in returned extensions', () => {
        it('context without data version, context doesnt change', async () => {
            let testContext = {} as any;
            await irrelevantEntitiesMiddleware(jest.fn(), undefined, {}, testContext, {});
            expect(testContext).toEqual({});
            testContext = { requestHeaders: {} } as any;
            await irrelevantEntitiesMiddleware(jest.fn(), undefined, {}, testContext, {});
            expect(testContext).toEqual({ requestHeaders: {} } as any);
            testContext = { requestHeaders: { dataVersion: undefined } } as any;
            await irrelevantEntitiesMiddleware(jest.fn(), undefined, {}, testContext, {});
            expect(testContext).toEqual({ requestHeaders: { dataVersion: undefined } } as any);
        });

        it('appends irrelevant entities by query name', async () => {
            const evenIds = ['2', '4', '6'];
            const testContext = { requestHeaders: { dataVersion: 1 } } as any;
            await irrelevantEntitiesMiddleware(jest.fn(), undefined, {}, testContext, {
                returnType: { ofType: { name: 'Book' } },
                path: { key: 'getEven' },
            });
            expect(testContext.returnedExtensions.irrelevantEntities).toEqual({ getEven: evenIds });
        });

        it('keeps searching for the query type even if its complex', async () => {
            const evenIds = ['2', '4', '6'];
            const testContext = { requestHeaders: { dataVersion: 1 } } as any;
            await irrelevantEntitiesMiddleware(jest.fn(), undefined, {}, testContext, {
                returnType: { ofType: { ofType: { name: 'Book' } } },
                path: { key: 'getEven' },
            });
            expect(testContext.returnedExtensions.irrelevantEntities).toEqual({ getEven: evenIds });
        });
        it('appends irrelevant entities by query name, multiple queries', async () => {
            const evenIds = ['2', '4', '6'];
            const testContext = {
                requestHeaders: { dataVersion: 1 },
                returnedExtensions: { irrelevantEntities: { getOdd: result } },
            } as any;
            await irrelevantEntitiesMiddleware(jest.fn(), undefined, {}, testContext, {
                returnType: { ofType: { name: 'Book' } },
                path: { key: 'getEven' },
            });
            expect(testContext.returnedExtensions.irrelevantEntities).toEqual({
                getEven: evenIds,
                getOdd: result,
            });
        });

        it('not searches for irrelevant if root is defined', async () => {
            const testContext = { requestHeaders: { dataVersion: 1 } } as any;
            await irrelevantEntitiesMiddleware(jest.fn(), {}, {}, testContext, {
                returnType: { ofType: { name: 'Book' } },
                path: { key: 'getEven' },
            });
            expect(testContext.returnedExtensions).toBeUndefined();
        });
    });
});
