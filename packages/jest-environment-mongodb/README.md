# jest-environment-mongodb

[![npm version](https://badge.fury.io/js/jest-environment-mongodb.svg)](https://badge.fury.io/js/jest-environment-mongodb)

Easily run [Jest](https://jestjs.io/) integration tests that require a running
[MongoDB](https://www.mongodb.com/) server

## Features

- Superfast in watch mode (use `--runInBand` to prevent MongoDB from rebooting
  between test-runs)
- Easy to set the storage engine per test file (use docblocks to override the
  default storage engine on a per file basis)
- Includes TypeScript type annotations

## Types

This package is written in TypeScript, type declarations (and source maps) are
included with the package so no need to install types separately. It also works
great with regular JavaScript.

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

## Default mode

The default behavior of `jest-environment-mongodb` is to run one MongoDB server
per Jest worker and to set up a new database for each test suite. This means you
have complete isolation between test suites and parallel test runs (workers).
While great for running many tests (in for example CI), it is also slow,
especially if you need to apply indexes to your collections. This becomes
particularly painful if you use watch mode when developing. However, you can
change this behavior with `--runInBand`, which will keep a single server running
between test runs, see the next section.

## TDD mode - keeping the MongoDB server alive between test suites

When starting Jest with the `--runInBand` (or the alias `-i`) CLI flag, a single
MongoDB server will be started and kept alive between test runs. This is useful
when running Jest in watch mode, as it prevents MongoDB from restarting between
every code change.

If you need to apply indexes to your DB before running tests, `--runInBand` will
give you an extra performance boost since you don't need to recreate the indexes
for every code-change/test-run.

The MongoDB server is also kept alive and shared between test suites.

Just remember to clean up your database between each test and this should give a
nice performance boost when developing.

Example:

```sh
jest --watch --runInBand mytests.test.js
```

## MongoDB server options

Configure the MongoDB server by passing options to `testEnvironmentOptions` of
your Jest configuration file.

The available `testEnvironmentOptions` are the same as for [`mongodb-memory-server`](https://www.npmjs.com/package/mongodb-memory-server)`.

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

The `jest-environment-mongodb` environment exposes two global variables:

```
global.__MONGO_URI__  // The server connection URI with a random db name
global.__MONGOD__     // The mongod instance from `mongodb-memory-server`
```

## Usage

```js
/**
 * @jest-environment mongodb
 */

import { MongoClient } from "mongodb";

let client;

beforeAll(async () => {
  client = await MongoClient.connect(global.MONGO_URI);
});

afterAll(async () => {
  await client.close();
});

beforeEach(async () => {
  // Reset the database before each test
  await client.db().dropDatabase();
});

it("should aggregate docs from collection", async () => {
  const files = db.collection("files");

  await files.insertMany([
    { type: "Document" },
    { type: "Video" },
    { type: "Image" },
    { type: "Document" },
    { type: "Image" },
    { type: "Document" },
  ]);

  const topFiles = await files
    .aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  expect(topFiles).toEqual([
    { _id: "Document", count: 3 },
    { _id: "Image", count: 2 },
    { _id: "Video", count: 1 },
  ]);
});
```

## See also

- [jest-environment-mongodb-wiredtiger](https://www.npmjs.com/package/jest-environment-mongodb-wiredtiger)
- [jest-environment-mongodb-ephemeral](https://www.npmjs.com/package/jest-environment-mongodb-ephemeral)
