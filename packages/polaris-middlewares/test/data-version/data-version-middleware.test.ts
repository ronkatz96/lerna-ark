import {dataVersionMiddleware} from "../../src/data-version/data-version-middleware";
import {expect} from "chai";
import {PolarisBaseContext} from "@enigmatis/polaris-common"

describe('data version middleware', () => {
    describe('root resolver', () => {
        it('should filter out entities with' +
            ' data version lower/equal to context', async () => {
            const root = undefined;
            const args = {};
            const context: PolarisBaseContext = {dataVersion: 2};
            const info = {};
            const objects = [{title: 'moshe', dataVersion: 2},
                {title: 'dani', dataVersion: 5}];
            const resolve = async (root, args, context, info) => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve,
                root, args, context, info);
            expect(result).to.deep.equal([{title: 'dani', dataVersion: 5}]);
        });
        it('no data version in context, root query, no filter should be applied', async () => {
            const context: PolarisBaseContext = {};
            const objects = [{title: 'moshe', dataVersion: 2},
                {title: 'dani', dataVersion: 5}];
            const resolve = async (root, args, context, info) => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve,
                undefined, {}, context, {});
            expect(result).to.deep.equal(objects);
        });
        it('context data version is not a number, no filter should be applied', async () => {
            const context: PolarisBaseContext = {dataVersion: undefined};
            const objects = [{title: 'moshe', dataVersion: 2},
                {title: 'dani', dataVersion: 5}];
            const resolve = async (root, args, context, info) => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve,
                undefined, {}, context, {});
            expect(result).to.deep.equal(objects);
        });
        it('entities does not have a data version property, no filter should be applied', async () => {
            const context: PolarisBaseContext = {dataVersion: 3};
            const objects = [{title: 'moshe'},
                {title: 'dani'}];
            const resolve = async (root, args, context, info) => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve,
                undefined, {}, context, {});
            expect(result).to.deep.equal(objects);
        });
        it ('a single entity is resolved, no filter should be applied', async()=>{
            const context: PolarisBaseContext = {dataVersion: 3};
            const objects = {title: 'moshe', dataVersion: 2};
            const resolve = async (root, args, context, info) => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve,
                undefined, {}, context, {});
            expect(result).to.deep.equal(objects);
        });
    });
    describe('not a root resolver', ()=>{
        it ('not a root resolver, no filter should be applied', async ()=>{
            const context: PolarisBaseContext = {dataVersion: 3};
            const objects = [{title: 'moshe', dataVersion: 2},
                {title: 'dani', dataVersion: 5}];
            const resolve = async (root, args, context, info) => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve,
                {name: 'bla'}, {}, context, {});
            expect(result).to.deep.equal(objects);
        });
    });
});