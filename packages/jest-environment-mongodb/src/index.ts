import { Config as JestConfig } from '@jest/types';
import NodeEnvironment from 'jest-environment-node';
import MongoDbMemoryServer from 'mongodb-memory-server';
import { MongoMemoryServerOptsT } from 'mongodb-memory-server/lib/MongoMemoryServer';

declare global {
  namespace NodeJS {
    interface Global {
      MONGO_URI: string;
      MONGO_DB_NAME: string;
      MONGOD: MongoDbMemoryServer;
    }
  }
}

export type MongoDbEnvironmentConfig = JestConfig.ProjectConfig & {
  testEnvironmentOptions?:
    | JestConfig.ProjectConfig['testEnvironmentOptions']
    | MongoMemoryServerOptsT;
};

export default class MongoDbEnvironment extends NodeEnvironment {
  private readonly mongod: MongoDbMemoryServer;

  constructor(config: MongoDbEnvironmentConfig) {
    super(config);

    this.mongod = new MongoDbMemoryServer(config.testEnvironmentOptions);
    this.global.MONGOD = this.mongod;
  }

  public async setup() {
    this.global.MONGO_URI = await this.mongod.getConnectionString();
    this.global.MONGO_DB_NAME = await this.mongod.getDbName();

    await super.setup();
  }

  public async teardown() {
    await this.mongod.stop();

    await super.teardown();
  }
}

module.exports = MongoDbEnvironment;
