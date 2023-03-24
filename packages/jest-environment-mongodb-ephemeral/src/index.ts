import MongoDbEnvironment, { MongoDbEnvironmentConfig } from "jest-environment-mongodb";
import type { EnvironmentContext } from "@jest/environment";

export default class EphemeralEnvironment extends MongoDbEnvironment {
  constructor(config: MongoDbEnvironmentConfig, context: EnvironmentContext) {
    config = {
      ...config,
      testEnvironmentOptions: {
        ...config.testEnvironmentOptions,
        instance: {
          ...config.testEnvironmentOptions?.instance ?? {},
          storageEngine: "ephemeralForTest"
        }
      }
    }
    super(config, context);
  }
}
