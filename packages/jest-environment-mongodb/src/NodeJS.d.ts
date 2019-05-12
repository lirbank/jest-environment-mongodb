import { MongoMemoryServer } from 'mongodb-memory-server';

declare module NodeJS {
  interface Global {
    MONGO_URI: string;
    MONGO_DB_NAME: string;
    MONGOD: MongoMemoryServer;
  }
}
