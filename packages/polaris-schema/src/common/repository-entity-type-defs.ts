import gql from 'graphql-tag';

export const repositoryEntityTypeDefs = gql`
    interface RepositoryEntity {
        id: String!
        deleted: Boolean!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
    }
`;
