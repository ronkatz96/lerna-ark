import {
    PolarisGraphQLContext,
    RealitiesHolder,
    UnsupportedRealityError,
} from '@enigmatis/polaris-common';
import { RealitiesMiddleware } from '../../src';
import { getContextWithRequestHeaders } from '../context-util';

const logger = { debug: jest.fn() } as any;
const realitiesHolder = new RealitiesHolder();
realitiesHolder.addReality({ id: 0, name: 'Real', type: 'Test' });
realitiesHolder.addReality({ id: 1, name: 'Non Real', type: 'Test' });
realitiesHolder.addReality({ id: 2, name: 'Non Real', type: 'Test' });
const realitiesMiddleware = new RealitiesMiddleware(logger, realitiesHolder).getMiddleware();
describe('reality id tests', () => {
    const operationalEntity = { title: 'Harry Potter', realityId: 0 };
    const notOperationalEntity = { title: 'Jurassic Park', realityId: 1 };
    const noRealityIdEntity = { title: 'Bible' };
    const entities = [operationalEntity, notOperationalEntity];
    const args = {};
    const info = {};
    const entitiesResolver = async () => {
        return entities;
    };
    const operationalEntityResolver = async () => {
        return operationalEntity;
    };
    const operationalEntityResolverArray = async () => {
        return [operationalEntity];
    };
    const notOperationalEntityResolver = async () => {
        return notOperationalEntity;
    };
    const notOperationalEntityResolverArray = async () => {
        return [notOperationalEntity];
    };
    const noRealityIdEntityResolver = async () => {
        return noRealityIdEntity;
    };
    const noRealityIdEntityResolverArray = async () => {
        return [noRealityIdEntity];
    };
    describe('root resolver', () => {
        const emptyRoot = undefined;
        it('no reality id in context, throws unsupported reality exception', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({});
            await expect(
                realitiesMiddleware(entitiesResolver, emptyRoot, args, context, info),
            ).rejects.toThrow(UnsupportedRealityError);
        });
        it('reality id is in context, array of entities, return only entities from that reality', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({ realityId: 1 });
            const result = await realitiesMiddleware(
                entitiesResolver,
                emptyRoot,
                args,
                context,
                info,
            );
            expect(result).toEqual([notOperationalEntity]);
        });
        it('reality id is in context, array of not repository entities, return operational and not repository entities', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({ realityId: 0 });
            const notRepositoryEntities = [
                operationalEntity,
                notOperationalEntity,
                noRealityIdEntity,
            ];
            const notRepositoryEntitiesResolver = async () => {
                return notRepositoryEntities;
            };
            const result = await realitiesMiddleware(
                notRepositoryEntitiesResolver,
                emptyRoot,
                args,
                context,
                info,
            );
            expect(result).toEqual([operationalEntity, noRealityIdEntity]);
        });
        it('reality id is in context, one entity with the same reality id, return that entity', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({ realityId: 1 });
            const result = await realitiesMiddleware(
                notOperationalEntityResolver,
                emptyRoot,
                args,
                context,
                info,
            );
            expect(result).toEqual(notOperationalEntity);
        });
        it('reality id is in context, one entity with different reality id, return null', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({ realityId: 2 });
            const result = await realitiesMiddleware(
                notOperationalEntityResolver,
                emptyRoot,
                args,
                context,
                info,
            );
            expect(result).toBeNull();
        });
        it('reality id is in context, entity without reality id, return that entity', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({ realityId: 1 });
            const result = await realitiesMiddleware(
                noRealityIdEntityResolver,
                emptyRoot,
                args,
                context,
                info,
            );
            expect(result).toEqual(noRealityIdEntity);
        });
    });

    describe('not a root resolver', () => {
        const notEmptyRoot = { parent: 'book' };
        describe('array of entities returned', () => {
            it('reality id is in context, entity with the same reality id in array, return array with that entity', async () => {
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                    realityId: 1,
                });
                const result = await realitiesMiddleware(
                    notOperationalEntityResolverArray,
                    notEmptyRoot,
                    args,
                    context,
                    info,
                );
                expect(result).toContain(notOperationalEntity);
            });
            it('reality id is in context, entity with different not operational reality id, return empty array', async () => {
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                    realityId: 2,
                });
                const result = await realitiesMiddleware(
                    notOperationalEntityResolverArray,
                    notEmptyRoot,
                    args,
                    context,
                    info,
                );
                expect(result).toStrictEqual([]);
            });
            it('reality id is in context, entity without reality id in array, return that entity', async () => {
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                    realityId: 1,
                });
                const result = await realitiesMiddleware(
                    noRealityIdEntityResolverArray,
                    notEmptyRoot,
                    args,
                    context,
                    info,
                );
                expect(result).toContain(noRealityIdEntity);
            });
            it('reality id and includeLinkedOper is in context, operational entity with different reality id from context in array, return that entity', async () => {
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                    realityId: 1,
                    includeLinkedOper: true,
                });
                const result = await realitiesMiddleware(
                    operationalEntityResolverArray,
                    notEmptyRoot,
                    args,
                    context,
                    info,
                );
                expect(result).toContain(operationalEntity);
            });
            it('reality id is in context and includeLinkedOper is false, operational entity with different reality id from context, return null', async () => {
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                    realityId: 1,
                    includeLinkedOper: false,
                });
                const result = await realitiesMiddleware(
                    operationalEntityResolverArray,
                    notEmptyRoot,
                    args,
                    context,
                    info,
                );
                expect(result).toStrictEqual([]);
            });
        });
        describe('one entity returned', () => {
            it('reality id is in context, one entity with the same reality id, return that entity', async () => {
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                    realityId: 1,
                });
                const result = await realitiesMiddleware(
                    notOperationalEntityResolver,
                    notEmptyRoot,
                    args,
                    context,
                    info,
                );
                expect(result).toEqual(notOperationalEntity);
            });
            it('reality id is in context, one entity with different, not operational reality id, return null', async () => {
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                    realityId: 2,
                });
                const result = await realitiesMiddleware(
                    notOperationalEntityResolver,
                    notEmptyRoot,
                    args,
                    context,
                    info,
                );
                expect(result).toBeNull();
            });
            it('reality id is in context, entity without reality id, return that entity', async () => {
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                    realityId: 1,
                });
                const result = await realitiesMiddleware(
                    noRealityIdEntityResolver,
                    notEmptyRoot,
                    args,
                    context,
                    info,
                );
                expect(result).toEqual(noRealityIdEntity);
            });
            it('reality id and includeLinkedOper is in context, operational entity with different reality id from context, return that entity', async () => {
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                    realityId: 1,
                    includeLinkedOper: true,
                });
                const result = await realitiesMiddleware(
                    operationalEntityResolver,
                    notEmptyRoot,
                    args,
                    context,
                    info,
                );
                expect(result).toEqual(operationalEntity);
            });
            it('reality id is in context and includeLinkedOper is false, operational entity with different reality id from context, return null', async () => {
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                    realityId: 1,
                    includeLinkedOper: false,
                });
                const result = await realitiesMiddleware(
                    operationalEntityResolver,
                    notEmptyRoot,
                    args,
                    context,
                    info,
                );
                expect(result).toBeNull();
            });
        });
    });
});
