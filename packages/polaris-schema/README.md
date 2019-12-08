![Small Logo](static/img/polaris-logo.png)

# polaris-schema

[![Build Status](https://travis-ci.com/Enigmatis/polaris-schema.svg?branch=master)](https://travis-ci.com/Enigmatis/polaris-schema)
[![NPM version](https://img.shields.io/npm/v/@enigmatis/polaris-schema.svg?style=flat-square)](https://www.npmjs.com/package/@enigmatis/polaris-schema)

#### Install

```
npm install polaris-schema
```

### Overview

This library helps you set all of the fundamental definitions of polaris based schema.

#### RepositoryEntity

This interface represents the base entity definitions of any graphql entity that we will create -
which means that any graphql entity you will use, must inherit this interface properties.
It consists the following properties:

-   id: the unique id of the entity.
-   deleted: whether the entity is soft deleted.
-   createdBy: who created the entity.
-   creationTime: when was the entity created.
-   lastUpdatedBy(_string - Optional_): who last updated the entity.
-   lastUpdateTime(_Date - Optional_): when was the entity last updated.
-   realityId: the id of the reality the entity is from.

#### RepositoryEntityTypeDefs

This member is the actual graphql interface type definition that consists of all of the `RepositoryEntity` properties
explained above.

#### ScalarsTypeDefs & ScalarsResolvers

All of the scalars supported by polaris-schema.

#### ExecutableSchemaCreator

This class will combine the type defs and resolvers offered by user, with polaris-schema repository entity and scalars,
to one executable schema.
