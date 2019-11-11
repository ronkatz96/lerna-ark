import { softDeletedMiddleware } from '../../src';
import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { getContextWithRequestHeaders } from '../context-util';

describe('soft delete middleware tests', () => {
    describe('an array instance', () => {
        describe('a non root resolver', () => {
            it('return only non-deleted entities', async () => {
                const objects = [
                    { title: 'moshe', deleted: false },
                    { title: 'dani', deleted: true },
                ];

                const resolve = async () => {
                    return objects;
                };
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({});
                const result = await softDeletedMiddleware(
                    resolve,
                    { name: 'bla' },
                    {},
                    context,
                    {},
                );
                expect(result).toEqual([{ title: 'moshe', deleted: false }]);
            });
        });
        describe('a root resolver', () => {
            it('return only non-deleted entities', async () => {
                const objects = [
                    { title: 'moshe', deleted: false },
                    { title: 'dani', deleted: true },
                ];
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({});

                const resolve = async () => {
                    return objects;
                };

                const result = await softDeletedMiddleware(resolve, undefined, {}, context, {});
                expect(result).toEqual([{ title: 'moshe', deleted: false }]);
            });
        });
    });

    describe('a single entity instance', () => {
        describe('a non root resolver', () => {
            it('return null if entity is deleted', async () => {
                const objects = { title: 'moshe', deleted: true };
                const resolve = async () => {
                    return objects;
                };
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({});

                const result = await softDeletedMiddleware(
                    resolve,
                    { name: 'bla' },
                    {},
                    context,
                    {},
                );
                expect(result).toBeNull();
            });

            it('return entity if its not deleted', async () => {
                const objects = { title: 'moshe', deleted: false };
                const resolve = async () => {
                    return objects;
                };
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({});

                const result = await softDeletedMiddleware(
                    resolve,
                    { name: 'bla' },
                    {},
                    context,
                    {},
                );
                expect(result).toEqual({ title: 'moshe', deleted: false });
            });
            it('return entity if it had no deleted property', async () => {
                const objects = { title: 'moshe' };
                const resolve = async () => {
                    return objects;
                };
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({});

                const result = await softDeletedMiddleware(
                    resolve,
                    { name: 'bla' },
                    {},
                    context,
                    {},
                );
                expect(result).toEqual({ title: 'moshe' });
            });
        });
        describe('a root resolver', () => {
            it('return null if entity is deleted', async () => {
                const objects = { title: 'moshe', deleted: true };
                const resolve = async () => {
                    return objects;
                };
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({});

                const result = await softDeletedMiddleware(resolve, undefined, {}, context, {});
                expect(result).toBeNull();
            });

            it('return entity if its not deleted', async () => {
                const objects = { title: 'moshe', deleted: false };
                const resolve = async () => {
                    return objects;
                };
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({});

                const result = await softDeletedMiddleware(resolve, undefined, {}, context, {});
                expect(result).toEqual({ title: 'moshe', deleted: false });
            });
            it('return entity if it had no deleted property', async () => {
                const objects = { title: 'moshe' };
                const resolve = async () => {
                    return objects;
                };
                const context: PolarisGraphQLContext = getContextWithRequestHeaders({});

                const result = await softDeletedMiddleware(resolve, undefined, {}, context, {});
                expect(result).toEqual({ title: 'moshe' });
            });
        });
    });
});
