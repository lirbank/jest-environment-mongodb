import { Config as JestConfig } from '@jest/types';
import NodeEnvironment from 'jest-environment-node';
import { MongoMemoryReplSet, MongoMemoryServer } from 'mongodb-memory-server';
import { MongoMemoryReplSetOptsT } from 'mongodb-memory-server-core/lib/MongoMemoryReplSet';
import { MongoMemoryServerOptsT } from 'mongodb-memory-server-core/lib/MongoMemoryServer';

declare global {
  namespace NodeJS {
    interface Global {
      MONGO_URI: string;
      MONGO_DB_NAME: string;
      MONGOD: MongoMemoryServer | MongoMemoryReplSet;
    }
  }
}

type ServerOpts = Partial<MongoMemoryServerOptsT> & { standalone?: true };
type ReplSetOpts = Partial<MongoMemoryReplSetOptsT> & { standalone: false };
type TestEnvironmentOptions = ServerOpts | ReplSetOpts;

export interface MongoDbEnvironmentConfig extends JestConfig.ProjectConfig {
  testEnvironmentOptions: TestEnvironmentOptions;
}

function isReplSetOpts(opts: TestEnvironmentOptions): opts is ReplSetOpts {
  return opts.standalone === false;
}

function isReplSet(
  server: MongoMemoryServer | MongoMemoryReplSet,
): server is MongoMemoryReplSet {
  return typeof Reflect.get(server, 'waitUntilRunning') === 'function';
}

// Use a single shared mongod instance (or replica set) when Jest is launched
// with the --runInBand flag
let mongod: MongoMemoryServer | MongoMemoryReplSet | null = null;

export default class MongoDbEnvironment extends NodeEnvironment {
  private readonly mongod: MongoMemoryServer | MongoMemoryReplSet;

  constructor(config: MongoDbEnvironmentConfig) {
    super(config);

    const opts = config.testEnvironmentOptions;
    const Server = isReplSetOpts(opts) ? MongoMemoryReplSet : MongoMemoryServer;

    if (this.runInBand) {
      if (!mongod) {
        mongod = new Server(opts);
      }

      this.mongod = mongod;
    } else {
      this.mongod = new Server(opts);
    }

    this.global.MONGOD = this.mongod;
  }

  public async setup() {
    // Need to wait due to:
    // https://github.com/nodkz/mongodb-memory-server/issues/74
    // https://github.com/nodkz/mongodb-memory-server/issues/166
    // await new Promise(r => setTimeout(r, 2000));
    if (isReplSet(this.mongod)) {
      await this.mongod.waitUntilRunning();
    }

    this.global.MONGO_URI = await this.mongod.getConnectionString();
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
