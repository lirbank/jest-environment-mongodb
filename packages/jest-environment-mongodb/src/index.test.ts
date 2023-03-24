/* @jest-environment ./src/index.ts */
import { MongoClient } from "mongodb";

declare namespace global {
  const __MONGO_URI__: string;
}

let client: MongoClient;

beforeAll(async () => {
  client = await MongoClient.connect(global.__MONGO_URI__);
});

afterAll(async () => {
  await client.close();
});

beforeEach(async () => {
  // Reset the database before each test
  await client.db().dropDatabase();
});

it("should aggregate docs from collection", async () => {
  expect(true).toBeTruthy()
  const files = client.db().collection("files");

  await files.insertMany([
    { type: "Document" },
    { type: "Video" },
    { type: "Image" },
    { type: "Document" },
    { type: "Image" },
    { type: "Document" },
  ]);

  const topFiles = await files
    .aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  expect(topFiles).toEqual([
    { _id: "Document", count: 3 },
    { _id: "Image", count: 2 },
    { _id: "Video", count: 1 },
  ]);
});
