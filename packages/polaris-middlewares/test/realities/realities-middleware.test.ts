import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { realitiesMiddleware } from '../../src';
import { getContextWithRequestHeaders } from '../context-util';

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
    const notOperationalEntityResolver = async () => {
        return notOperationalEntity;
    };
    const noRealityIdEntityResolver = async () => {
        return noRealityIdEntity;
    };
    describe('root resolver', () => {
        const emptyRoot = undefined;
        it('no reality id in context, array of entities, return operational entities', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({});
            const result = await realitiesMiddleware(
                entitiesResolver,
                emptyRoot,
                args,
                context,
                info,
            );
            expect(result).toEqual([operationalEntity]);
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
        it('no reality id in context, one operational entity, return entity', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({});
            const result = await realitiesMiddleware(
                operationalEntityResolver,
                emptyRoot,
                args,
                context,
                info,
            );
            expect(result).toEqual(operationalEntity);
        });
        it('no reality id in context, one not operational entity, return null', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({});
            const result = await realitiesMiddleware(
                notOperationalEntityResolver,
                emptyRoot,
                args,
                context,
                info,
            );
            expect(result).toBeNull();
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
        it('no reality id in context, operational entity, return entity', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({});
            const result = await realitiesMiddleware(
                operationalEntityResolver,
                notEmptyRoot,
                args,
                context,
                info,
            );
            expect(result).toEqual(operationalEntity);
        });
        it('no reality id in context, one not operational entity, return null', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({});
            const result = await realitiesMiddleware(
                notOperationalEntityResolver,
                notEmptyRoot,
                args,
                context,
                info,
            );
            expect(result).toBeNull();
        });
        it('reality id is in context, one entity with the same reality id, return that entity', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({ realityId: 1 });
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
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({ realityId: 2 });
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
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({ realityId: 1 });
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
