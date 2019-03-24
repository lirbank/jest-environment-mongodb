import MongoDbEnvironment, { MongoDbEnvironmentConfig } from '.';

export default class WiredTigerEnvironment extends MongoDbEnvironment {
  constructor(config: MongoDbEnvironmentConfig) {
    super({
      ...config,
      testEnvironmentOptions: {
        ...config.testEnvironmentOptions,
        instance: {
          ...config.testEnvironmentOptions.instance,
          storageEngine: 'wiredTiger',
        },
      },
    });
  }
}

module.exports = WiredTigerEnvironment;
