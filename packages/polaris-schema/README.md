![Small Logo](static/img/polaris-logo.png)

# polaris-schema

[![Build Status](https://travis-ci.com/Enigmatis/polaris-schema.svg?branch=master)](https://travis-ci.com/Enigmatis/polaris-schema)
[![NPM version](https://img.shields.io/npm/v/@enigmatis/polaris-schema.svg?style=flat-square)](https://www.npmjs.com/package/@enigmatis/polaris-schema)

#### Install

```
npm install polaris-schema
```

### Overview
This library helps you to set the fundamental definitions of the polaris based schema that you are going to create.

#### RepositoryEntity
This interface represents the base entity definitions of any graphql entity that we will create - 
which means that every graphql entity will inherit this interface properties.
It's consists of the following properties:
- id: the unique id of the entity. 
- deleted: an indication whether the entity considered as soft deleted.
- createdBy: who created the entity.
- creationTime: when does the entity was created.
- lastUpdatedBy: who last updated the entity.
- lastUpdateTime: when does the entity last updated.
- realityId: an indication what is the reality of the entity.

#### RepositoryEntityTypeDefs
This member is the actual graphql interface type definition that consists of all of the ``RepositoryEntity`` properties 
explained above.

#### ScalarsResolvers
This member defines the base scalars resolvers which will supported in the repository that you are going to establish.

#### ScalarsTypeDefs
This member defines the actual base graphql scalar type defs that will supported in the repository that we are going to 
create.

#### ExecutableSchemaCreator
Through this class we will combine between the base scalar type defs and resolvers that offered in every repository 
created and the type defs and resolvers that you will create in your own, and generate an executable schema that we can 
manipulate and use as we wish to.