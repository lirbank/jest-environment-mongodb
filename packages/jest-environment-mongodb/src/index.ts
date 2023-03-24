import { randomUUID } from "node:crypto";

import type {
  EnvironmentContext,
  JestEnvironmentConfig,
} from "@jest/environment";
import type { Config as JestConfig, Global as JestGlobal } from "@jest/types";
import NodeEnvironment from "jest-environment-node";
import { MongoMemoryServer } from "mongodb-memory-server";
import type { MongoMemoryServerOpts } from "mongodb-memory-server-core/lib/MongoMemoryServer";

export type MongoDbEnvironmentConfig = JestEnvironmentConfig & {
  testEnvironmentOptions?:
  | JestConfig.ProjectConfig["testEnvironmentOptions"]
  | MongoMemoryServerOpts;
};

type Global = JestGlobal.Global & {
  __MONGO_URI__?: string;
  __MONGOD__?: MongoMemoryServer;
};

let _mongod: MongoMemoryServer | null = null;

// eslint-disable-next-line import/no-unused-modules
export default class MongoDbEnvironment extends NodeEnvironment {
  private testEnvironmentOptions: MongoDbEnvironmentConfig["testEnvironmentOptions"];
  private dbName: string;

  override global: Global = this.global;

  constructor(config: MongoDbEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);

    this.testEnvironmentOptions = config.testEnvironmentOptions;
    this.dbName = randomUUID();
  }

  private async getInstance() {
    if (this.runInBand) {
      if (!_mongod) {
        _mongod = await MongoMemoryServer.create(
          this.testEnvironmentOptions
        );
      }
      this.global.__MONGOD__ = _mongod;
    }
    if (!this.global.__MONGOD__) {
      console.log("create__");
      this.global.__MONGOD__ = await MongoMemoryServer.create(
        this.testEnvironmentOptions
      );
    }
    return this.global.__MONGOD__;
  }

  public override async setup(): Promise<void> {
    const instance = await this.getInstance();
    if (instance.state === "new") await instance.start();
    this.global.__MONGO_URI__ = instance.getUri(this.dbName);

    await super.setup();
  }

  public override async teardown(): Promise<void> {
    if (this.global.__MONGOD__) await this.global.__MONGOD__.stop();

    await super.teardown();
  }

  private get runInBand(): boolean {
    // '-i' is an alias for '--runInBand'
    // https://jestjs.io/docs/en/cli#runinband
    return process.argv.includes("--runInBand") || process.argv.includes("-i");
  }
}
