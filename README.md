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

The [available
options](https://www.npmjs.com/package/mongodb-memory-server#available-options)
are the same as the options `mongodb-memory-server` takes.

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
