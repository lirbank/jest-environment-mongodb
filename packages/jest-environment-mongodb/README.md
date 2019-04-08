# jest-environment-mongodb

[![npm version](https://badge.fury.io/js/jest-environment-mongodb.svg)](https://badge.fury.io/js/jest-environment-mongodb)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Easily run [Jest](https://jestjs.io/) integration tests that require a running
[MongoDB](https://www.mongodb.com/) server

## Types

This package is written in TypeScript, type declarations (and source maps) are
included with the package so no need to install types separately. It also works
with regular JavaScript.

## Installation

NPM

```sh
npm install --save-dev mongodb-memory-server jest-environment-mongodb
```

Yarn

```sh
yarn add --dev mongodb-memory-server jest-environment-mongodb
```

## Configuration - configuration file

To use `jest-environment-mongodb` as the default test environment, update your
[Jest configuration](https://jestjs.io/docs/en/configuration) as follows:

```json
{
  "testEnvironment": "mongodb"
}
```

To set the test environment on a per file or file pattern basis, consider using
a docblock (see the next section) or configure
[Jest projects](https://jestjs.io/docs/en/configuration#projects-array-string-projectconfig).

## Configuration - docblock

By adding a `@jest-environment`
[docblock](https://jestjs.io/docs/en/configuration#testenvironment-string) at
the top of a test file, you can specify `mongodb` to be used for all tests in
that file:

```js
/**
 * @jest-environment mongodb
 */
```

This overrides any environment set by `testEnvironment` in the Jest
configuration file.

For docblock usage,
[jest-environment-mongodb-wiredtiger](https://www.npmjs.com/package/jest-environment-mongodb-wiredtiger)
and
[jest-environment-mongodb-ephemeral](https://www.npmjs.com/package/jest-environment-mongodb-ephemeral)
may come in handy.

## Options

Configure the MongoDB server by passing options to `testEnvironmentOptions` of
your Jest configuration file.

The available `testEnvironmentOptions` are the same as the
`mongodb-memory-server`
[options](https://www.npmjs.com/package/mongodb-memory-server#available-options).

Example:

```json
{
  "testEnvironment": "mongodb",
  "testEnvironmentOptions": {
    "binary": {
      "version": "3.6.5"
    },
    "instance": {
      "storageEngine": "wiredTiger"
    }
  }
}
```

MongoDB options provided via `testEnvironmentOptions` also applies to docblock
environments.

## Globals

The `jest-environment-mongodb` environment exposes three global variables:

```
global.MONGO_URI      // The server connection URI
global.MONGO_DB_NAME  // The database name
global.MONGOD         // The mongod instance from `mongodb-memory-server`
```

## Usage

```js
/**
 * @jest-environment mongodb
 */

import { MongoClient } from 'mongodb';

let client;
let db;

beforeAll(async () => {
  client = await MongoClient.connect(global.MONGO_URI);
  db = await client.db(global.MONGO_DB_NAME);
});

afterAll(async () => {
  await client.close();
});

beforeEach(async () => {
  // Reset the database before each test
  await db.dropDatabase();
});

it('should aggregate docs from collection', async () => {
  const files = db.collection('files');

  await files.insertMany([
    { type: 'Document' },
    { type: 'Video' },
    { type: 'Image' },
    { type: 'Document' },
    { type: 'Image' },
    { type: 'Document' },
  ]);

  const topFiles = await files
    .aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  expect(topFiles).toEqual([
    { _id: 'Document', count: 3 },
    { _id: 'Image', count: 2 },
    { _id: 'Video', count: 1 },
  ]);
});
```

## See also

- [jest-environment-mongodb-wiredtiger](https://www.npmjs.com/package/jest-environment-mongodb-wiredtiger)
- [jest-environment-mongodb-ephemeral](https://www.npmjs.com/package/jest-environment-mongodb-ephemeral)
