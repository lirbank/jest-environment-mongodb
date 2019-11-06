# Changelog

### v1.0.2

- Update `mongodb-memory-server` peer dependency to allow version 6.x
- Upgrade dependencies

### v1.0.1

- Add `MONGO_URI`, `MONGO_DB_NAME`, and `MONGOD` on the Global interface
  (TypeScript).

### v1.0.0

- When starting Jest with `--runInBand` (or the alias `-i`), a single MongoDB
  server is started and kept alive between tests.
