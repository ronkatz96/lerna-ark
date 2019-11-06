import { GraphQLInterfaceType, GraphQLScalarType, GraphQLSchema } from 'graphql';
import gql from 'graphql-tag';
import { makeExecutablePolarisSchema } from '../../src/main';

describe('makeExecutablePolarisSchema tests', () => {
    const typeDefs = gql`
        type Book implements RepositoryEntity {
            title: String
        }

        type Query {
            book: Book
        }
    `;

    const resolvers = {
        Query: {
            book() {
                return {
                    title: 'foo',
                };
            },
        },
    };

    test('making polaris schema, returns GraphQLSchema', () => {
        const polarisSchema = makeExecutablePolarisSchema(typeDefs, resolvers);
        expect(polarisSchema).toBeInstanceOf(GraphQLSchema);
    });

    test('creating polaris schema, has RepositoryEntity as GraphQLInterfaceType', () => {
        const polarisSchema = makeExecutablePolarisSchema(typeDefs, resolvers);
        const bookType = polarisSchema.getType('RepositoryEntity');
        expect(bookType).toBeDefined();
        expect(bookType).toBeInstanceOf(GraphQLInterfaceType);
    });

    test('creating polaris schema, has DateTime as GraphQLScalarType', () => {
        const polarisSchema = makeExecutablePolarisSchema(typeDefs, resolvers);
        const dateScalarType = polarisSchema.getType('DateTime');
        expect(dateScalarType).toBeDefined();
        expect(dateScalarType).toBeInstanceOf(GraphQLScalarType);
    });
});
