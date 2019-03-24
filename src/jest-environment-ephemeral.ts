import MongoDbEnvironment, { MongoDbEnvironmentConfig } from '.';

export default class EphemeralEnvironment extends MongoDbEnvironment {
  constructor(config: MongoDbEnvironmentConfig) {
    super({
      ...config,
      testEnvironmentOptions: {
        ...config.testEnvironmentOptions,
        instance: {
          ...config.testEnvironmentOptions.instance,
          storageEngine: 'ephemeralForTest',
        },
      },
    });
  }
}

module.exports = EphemeralEnvironment;
