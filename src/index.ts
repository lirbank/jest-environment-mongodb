import { Config as JestConfig } from '@jest/types';
import NodeEnvironment from 'jest-environment-node';
import MongoDbMemoryServer from 'mongodb-memory-server';
import { MongoMemoryServerOptsT } from 'mongodb-memory-server/lib/MongoMemoryServer';

declare global {
  namespace NodeJS {
    interface Global {
      mongodb: {
        readonly uri: string;
        readonly dbName: string;
      };
      mongod: MongoDbMemoryServer;
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
    this.global.mongod = this.mongod;
  }

  public async setup() {
    this.global.mongodb = {
      dbName: await this.mongod.getDbName(),
      uri: await this.mongod.getConnectionString(),
    };

    await super.setup();
  }

  public async teardown() {
    await this.mongod.stop();

    await super.teardown();
  }
}

module.exports = MongoDbEnvironment;
