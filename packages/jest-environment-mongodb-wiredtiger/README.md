# jest-environment-mongodb-wiredtiger

[![npm version](https://badge.fury.io/js/jest-environment-mongodb-wiredtiger.svg)](https://badge.fury.io/js/jest-environment-mongodb-wiredtiger)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

This package provides a wrapper around
[jest-environment-mongodb](https://www.npmjs.com/package/jest-environment-mongodb)
with the `storageEngine` setting preconfigured to `wiredTiger`.

This makes it possible to set the storage engine on a per test file basis via
docblocks, without setting up Jest projects.

## Installation

NPM

```sh
npm install --save-dev mongodb-memory-server jest-environment-mongodb-wiredtiger
```

Yarn

```sh
yarn add --dev mongodb-memory-server jest-environment-mongodb-wiredtiger
```

## Usage

By adding a `@jest-environment`
[docblock](https://jestjs.io/docs/en/configuration#testenvironment-string) at
the top of a test file, you can specify `jest-environment-mongodb-wiredtiger` to
be used for all tests in that file:

```js
/**
 * @jest-environment jest-environment-mongodb-wiredtiger
 */
```

This overrides any environment set by `testEnvironment` in the Jest
configuration file.

Additionally, any `instance.storageEngine` option provided by
`testEnvironmentOptions` will be overridden with `wiredTiger`. All other
`testEnvironmentOptions` will be in effect.

## See also

[jest-environment-mongodb-ephemeral](https://www.npmjs.com/package/jest-environment-mongodb-ephemeral)
[jest-environment-mongodb](https://www.npmjs.com/package/jest-environment-mongodb)
