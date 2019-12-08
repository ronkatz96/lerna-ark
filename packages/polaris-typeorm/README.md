![Small Logo](static/img/polaris-logo.png)

# polaris-typeorm

[![Build Status](https://travis-ci.com/Enigmatis/polaris-typeorm.svg?branch=master)](https://travis-ci.com/Enigmatis/polaris-typeorm)
[![NPM version](https://img.shields.io/npm/v/@enigmatis/polaris-typeorm.svg?style=flat-square)](https://www.npmjs.com/package/@enigmatis/polaris-typeorm)

#### Install

```
npm install polaris-typeorm
```

### Overview

This library provides support and wrappers for typeorm functionality. [[Typeorm]](https://github.com/typeorm/typeorm)

#### CreateConnection

Through this class we can create the polaris connection to our DB on top of typeorm.

#### CommonModel

This class represents the base entity that all of your polaris entities should inherit from.
It provides default fields for your entity :

-   createdBy(_string - Optional_) - this field indicates who created the entity.
-   creationTime - when was the entity created.
-   lastUpdateBy(_string - Optional_) - this field indicates who last updated the entity.
-   lastUpdateTime - when was the entity last updated.
-   dataVersion - every common model is a versioned entity and contains a version related to their data - a dataVersion.
-   realityId - this field indicates what is the reality of the entity.
-   deleted - this field indicates whether the entity is "soft deleted".

Let's take a look at a simple example :

```
@Entity()
export class SimpleEntity extends CommonModel {
...
}
```

So now `SimpleEntity` also includes all of the above properties.

#### PolarisEntityManager

This class extends the typeorm original `EntityManager` logic - adds a relevant filters such as reality filters,
data version filters and also supports the soft delete mechanism.
You can access this CRUD methods in 2 ways :

1. through the `PolarisEntityManager` class.
2. through typeorm repositories.

#### TypeORMConfig

Through this config you should set whether you want soft delete mechanism in your repository.
The default value of `allowSoftDelete` is true, you can set it to false by sending `allowSoftDelete` as false.
