import { Config as JestConfig } from '@jest/types';
import NodeEnvironment from 'jest-environment-node';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoMemoryServerOptsT } from 'mongodb-memory-server-core/lib/MongoMemoryServer';

// declare global {
//   namespace NodeJS {
//     interface Global {
//       MONGO_URI: string;
//       MONGO_DB_NAME: string;
//       MONGOD: MongoMemoryServer;
//     }
//   }
// }

export type MongoDbEnvironmentConfig = JestConfig.ProjectConfig & {
  testEnvironmentOptions?:
    | JestConfig.ProjectConfig['testEnvironmentOptions']
    | MongoMemoryServerOptsT;
};

// Use a single shared mongod instance when Jest is launched with the
// --runInBand flag
let mongod: MongoMemoryServer | null = null;

export default class MongoDbEnvironment extends NodeEnvironment {
  private readonly mongod: MongoMemoryServer;

  constructor(config: MongoDbEnvironmentConfig) {
    super(config);

    if (this.runInBand) {
      if (!mongod) {
        mongod = new MongoMemoryServer(config.testEnvironmentOptions);
      }

      this.mongod = mongod;
    } else {
      this.mongod = new MongoMemoryServer(config.testEnvironmentOptions);
    }

    this.global.MONGOD = this.mongod;
  }

  public async setup() {
    this.global.MONGO_URI = await this.mongod.getUri();
    this.global.MONGO_DB_NAME = await this.mongod.getDbName();

    await super.setup();
  }

  public async teardown() {
    if (!this.runInBand) {
      await this.mongod.stop();
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
