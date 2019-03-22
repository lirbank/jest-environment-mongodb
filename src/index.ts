import { Config } from '@jest/types';
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
    }
  }
}

export default class MongoDbEnvironment extends NodeEnvironment {
  private readonly mongod: MongoDbMemoryServer;

  constructor(
    config: Config.ProjectConfig & {
      testEnvironmentOptions:
        | Config.ProjectConfig['testEnvironmentOptions']
        | MongoMemoryServerOptsT;
    },
  ) {
    super(config);
    this.mongod = new MongoDbMemoryServer(config.testEnvironmentOptions);
  }

  public async setup() {
    this.global.mongodb = {
      dbName: await this.mongod.getDbName(),
      uri: await this.mongod.getConnectionString(),
    };

    await super.setup();
  }
}

module.exports = MongoDbEnvironment;
