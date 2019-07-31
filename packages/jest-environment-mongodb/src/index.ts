import { Config as JestConfig } from '@jest/types';
import NodeEnvironment from 'jest-environment-node';
import { MongoMemoryReplSet, MongoMemoryServer } from 'mongodb-memory-server';
import { MongoMemoryServerOptsT } from 'mongodb-memory-server-core/lib/MongoMemoryServer';

declare global {
  namespace NodeJS {
    interface Global {
      MONGO_URI: string;
      MONGO_DB_NAME: string;
      MONGOD: MongoMemoryServer;
      // MONGO_REPL_SET: MongoMemoryReplSet;
    }
  }
}

export type MongoDbEnvironmentConfig = JestConfig.ProjectConfig & {
  testEnvironmentOptions?:
    | JestConfig.ProjectConfig['testEnvironmentOptions']
    | MongoMemoryServerOptsT;
};

// Use a single shared mongod instance when Jest is launched with the
// --runInBand flag
let mongod: MongoMemoryServer | null = null;
let replSet: MongoMemoryReplSet | null = null;

export default class MongoDbEnvironment extends NodeEnvironment {
  private readonly mongod: MongoMemoryServer;
  private readonly replSet: MongoMemoryReplSet;

  constructor(config: MongoDbEnvironmentConfig) {
    super(config);

    if (this.runInBand) {
      if (!mongod) {
        mongod = new MongoMemoryServer(config.testEnvironmentOptions);
      }

      if (!replSet) {
        replSet = new MongoMemoryReplSet({
          binary: {
            version: '4.0.4',
          },
          instanceOpts: [{ storageEngine: 'wiredTiger' }],
        });
      }

      this.mongod = mongod;
      this.replSet = replSet;
    } else {
      this.mongod = new MongoMemoryServer(config.testEnvironmentOptions);

      this.replSet = new MongoMemoryReplSet({
        binary: {
          version: '4.0.4',
        },
        instanceOpts: [{ storageEngine: 'wiredTiger' }],
      });
    }

    this.global.MONGOD = this.mongod;
  }

  public async setup() {
    await this.replSet.waitUntilRunning();
    // Need to wait due to:
    // https://github.com/nodkz/mongodb-memory-server/issues/74
    // https://github.com/nodkz/mongodb-memory-server/issues/166
    // await new Promise(r => setTimeout(r, 2000));

    this.global.MONGO_URI = await this.replSet.getConnectionString();
    this.global.MONGO_DB_NAME = await this.replSet.getDbName();
    // this.global.MONGO_URI = await this.mongod.getConnectionString();
    // this.global.MONGO_DB_NAME = await this.mongod.getDbName();

    await super.setup();
  }

  public async teardown() {
    if (!this.runInBand) {
      await this.mongod.stop();
      await this.replSet.stop();
    }

    await super.teardown();
  }

  private get runInBand(): boolean {
    // '-i' is an alias for '--runInBand'
    // https://jestjs.io/docs/en/cli#runinband
    return process.argv.includes('--runInBand') || process.argv.includes('-i');
  }
}

module.exports = MongoDbEnvironment;
