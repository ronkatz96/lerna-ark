# polaris-delta-middleware

This package contains middlewares for delta handling by a polaris graphql server.

You can use these middlewares & extensions separately using your apollo server.

For example:
```javascript
    // rest of imports
    import {
        dataVersionMiddleware,
        initContextForDataVersion,
        softDeletedMiddleware,
        IrrelevantEntitiesExtension
    } from 'polaris-delta-middleware';

    const schema = makeExecutableSchema({typeDefs, resolvers});
    const executableSchema = applyMiddleware(schema, dataVersionMiddleware, softDeletedMiddleware); // applying polaris-delta-middlewares
    const config = {schema: executableSchema, context: initContextForDataVersion,  // initializing context using polaris-delta-middleware
    extensions: [()=> new IrrelevantEntitiesExtension()]}; // applying irrelevant entities extensions
    const server = new ApolloServer(config);
    // rest of code 
```

## Data Version Middleware
Data version is a sequence that indicates a version of an entity.
If you want to use polling in order to receive query differences (Deltas), you can use the data version middleware.

This middleware filters array of entities: if the entities have the field ``dataVersion`` set on them, the middleware return only entities that have a bigger ``dataVersion`` than
the data version that is set on the context (``context.dataVersion``).
If no ``dataVersion`` is set on context, no filter will be applied.
If a single entity is returned, or array of entities with no data version field, no filter will be applied.

For example:
```javascript
const beforeMiddleware = [
    {title: 'x', dataVersion: 2},
    {title: 'y', dataVersion: 5}
];

const afterMiddleware = [{title:'x', dataVersion:5}]; // context.dataVersion is set to 3
```
You can use `initContextForDataVersion` to init the `dataVersion` 
property in context from the request headers (header name is `data-version`).

## Soft Delete Middleware
It works similar to data version middleware, filtering out all entities which are soft deleted (has a property called `deleted` set to true).

For example:
```javascript
const beforeMiddleware = [{title: 'x', deleted: true}, {title:'y', deleted: false}];
const afterMiddleware = [{title: 'y', deleted: false}];
```

## Irrelevant entities extension
If your context object contains an irrelevant entities object under property `context.irrelevantEntities`,
it adds the value of this property to the extensions object in the graphql response.

for example, setting the context irrelevant entities:
```javascript
context.irrelevantEntities = {books: [1,2,3]};
```

and the graphql response:
```javascript
{
    data: {...},
    errors:[],
    extensions: {
        books: [1,2,3]
    }   
}
```