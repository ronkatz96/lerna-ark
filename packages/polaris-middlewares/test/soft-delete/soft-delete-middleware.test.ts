import {expect} from "chai";
import {softDeletedMiddleware} from "../../src/soft-delete/soft-delete-middleware"
import {PolarisBaseContext} from "@enigmatis/polaris-common"

describe('soft delete middleware tests', () => {
    describe('an array instance', () => {
        describe('a non root resolver', () => {
            it('return only non-deleted entities', async () => {
                const objects = [{title: 'moshe', deleted: false},
                    {title: 'dani', deleted: true}];

                const resolve = async (root: any, args: any, context: any, info: any) => {
                    return objects;
                };
                const context: PolarisBaseContext = {};
                const result = await softDeletedMiddleware(resolve,
                    {name: 'bla'}, {}, context, {});
                expect(result).to.deep.equal([{title: 'moshe', deleted: false}]);
            });
        });
        describe('a root resolver', () => {
            it('return only non-deleted entities', async () => {
                const objects = [{title: 'moshe', deleted: false},
                    {title: 'dani', deleted: true}];
                const context: PolarisBaseContext = {};

                const resolve = async (root: any, args: any, context: any, info: any) => {
                    return objects;
                };

                const result = await softDeletedMiddleware(resolve,
                    undefined, {}, context, {});
                expect(result).to.deep.equal([{title: 'moshe', deleted: false}]);
            });
        });
    });

    describe('a single entity instance', () => {
        describe('a non root resolver', () => {
            it('return null if entity is deleted', async () => {
                const objects = {title: 'moshe', deleted: true};
                const resolve = async (root: any, args: any, context: any, info: any) => {
                    return objects;
                };
                const context: PolarisBaseContext = {};

                const result = await softDeletedMiddleware(resolve,
                    {name: 'bla'}, {}, context, {});
                expect(result).to.be.null;
            });

            it('return entity if its not deleted', async () => {
                const objects = {title: 'moshe', deleted: false};
                const resolve = async (root: any, args: any, context: any, info: any) => {
                    return objects;
                };
                const context: PolarisBaseContext = {};

                const result = await softDeletedMiddleware(resolve,
                    {name: 'bla'}, {}, context, {});
                expect(result).to.deep.equal({title: 'moshe', deleted: false});
            });
            it('return entity if it had no deleted property', async () => {
                const objects = {title: 'moshe'};
                const resolve = async (root: any, args: any, context: any, info: any) => {
                    return objects;
                };
                const context: PolarisBaseContext = {};

                const result = await softDeletedMiddleware(resolve,
                    {name: 'bla'}, {}, context, {});
                expect(result).to.deep.equal({title: 'moshe'});
            });
        });
        describe('a root resolver', () => {
            it('return null if entity is deleted', async () => {
                const objects = {title: 'moshe', deleted: true};
                const resolve = async (root: any, args: any, context: any, info: any) => {
                    return objects;
                };
                const context: PolarisBaseContext = {};

                const result = await softDeletedMiddleware(resolve,
                    undefined, {}, context, {});
                expect(result).to.be.null;
            });

            it('return entity if its not deleted', async () => {
                const objects = {title: 'moshe', deleted: false};
                const resolve = async (root: any, args: any, context: any, info: any) => {
                    return objects;
                };
                const context: PolarisBaseContext = {};

                const result = await softDeletedMiddleware(resolve,
                    undefined, {}, context, {});
                expect(result).to.deep.equal({title: 'moshe', deleted: false});
            });
            it('return entity if it had no deleted property', async () => {
                const objects = {title: 'moshe'};
                const resolve = async (root: any, args: any, context: any, info: any) => {
                    return objects;
                };
                const context: PolarisBaseContext = {};

                const result = await softDeletedMiddleware(resolve,
                    undefined, {}, context, {});
                expect(result).to.deep.equal({title: 'moshe'});
            });
        });
    });
});
