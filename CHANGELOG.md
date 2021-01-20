# Changelog

### v1.0.5

- Upgrade dependencies

### v1.0.4

- Fixes broken build in v1.0.3
- Upgrade dependencies with security patches

### v1.0.3

- Change call to deprecated `getConnectionString` to be `getUri`

### v1.0.2

- Update `mongodb-memory-server` peer dependency to allow version 6.x
- Upgrade dependencies

### v1.0.1

- Add `MONGO_URI`, `MONGO_DB_NAME`, and `MONGOD` on the Global interface
  (TypeScript).

### v1.0.0

- When starting Jest with `--runInBand` (or the alias `-i`), a single MongoDB
  server is started and kept alive between tests.
