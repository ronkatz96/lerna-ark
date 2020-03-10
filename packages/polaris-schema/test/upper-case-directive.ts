import { SchemaDirectiveVisitor } from 'graphql-tools';
import { defaultFieldResolver } from 'graphql/execution';
import { GraphQLField, GraphQLObjectType, GraphQLInterfaceType } from 'graphql';

export class UpperCaseDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(
        field: GraphQLField<any, any>,
        details: { objectType: GraphQLObjectType | GraphQLInterfaceType },
    ): GraphQLField<any, any> | void | null {
        const { resolve = defaultFieldResolver } = field;
        field.resolve = async (...args) => {
            const result = await resolve.apply(this, args);
            if (typeof result === 'string') {
                return result.toUpperCase();
            }
            return result;
        };
    }
}
