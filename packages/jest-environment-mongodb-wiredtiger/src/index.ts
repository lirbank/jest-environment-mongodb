import MongoDbEnvironment, { MongoDbEnvironmentConfig } from "jest-environment-mongodb";
import type { EnvironmentContext } from "@jest/environment";

export default class WiredTigerEnvironment extends MongoDbEnvironment {
  constructor(config: MongoDbEnvironmentConfig, context: EnvironmentContext) {
    config = {
      ...config,
      testEnvironmentOptions: {
        ...config.testEnvironmentOptions,
        instance: {
          ...config.testEnvironmentOptions?.instance ?? {},
          storageEngine: "wiredTiger"
        }
      }
    }
    super(config, context);
  }
}
