# jest-environment-mongodb

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
  "testEnvironment": "jest-environment-mongodb"
}
```

To set the test environment on a per file or file pattern basis, consider using
a docblock (next) or configure [Jest
projects](https://jestjs.io/docs/en/configuration#projects-array-string-projectconfig).

## Configuration - docblock

By adding a `@jest-environment`
[docblock](https://jestjs.io/docs/en/configuration#testenvironment-string) at
the top of a test file, you can specify `jest-environment-mongodb` to be used
for all tests in that file:

```js
/**
 * @jest-environment jest-environment-mongodb
 */
```

This overrides any environment set by `testEnvironment` in the [Jest
configuration](https://jestjs.io/docs/en/configuration) for the current file.

## Options

Configure the MongoDB server by passing options to `testEnvironmentOptions` of
your [Jest configuration](https://jestjs.io/docs/en/configuration).

The available `testEnvironmentOptions` are the same as the
`mongodb-memory-server`
[options](https://www.npmjs.com/package/mongodb-memory-server#available-options).

```json
{
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

## Globals

The `jest-environment-mongodb` environment exposes three global variables:

```
global.mongodb.uri     // The server connection URI
global.mongodb.dbName  // The database name
global.mongod          // The mongod instance from `mongodb-memory-server`
```

## Usage

```js
/**
 * @jest-environment jest-environment-mongodb
 */

import { MongoClient } from 'mongodb';

let client;
let db;

beforeAll(async () => {
  client = await MongoClient.connect(global.mongodb.uri);
  db = await connection.db(global.mongodb.dbName);
});

afterAll(async () => {
  await client.close();
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
