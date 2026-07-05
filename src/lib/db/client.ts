import { type Db, MongoClient } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClient: MongoClient | undefined;
  mongoDb: Db | undefined;
};

function getUri(): string {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI environment variable is not set");
  }
  return uri;
}

/** Shared MongoDB client (reused across hot reloads and serverless invocations). */
export function getMongoClient(): MongoClient {
  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(getUri());
  }
  return globalForMongo.mongoClient;
}

/** Default database from the connection string. */
export function getDb(): Db {
  if (!globalForMongo.mongoDb) {
    globalForMongo.mongoDb = getMongoClient().db();
  }
  return globalForMongo.mongoDb;
}

/** Ensure indexes exist (idempotent; safe to call on each cold start). */
export async function ensureDbIndexes(): Promise<void> {
  const db = getDb();

  await Promise.all([
    db
      .collection("chat_sessions")
      .createIndex({ userId: 1, updatedAt: -1 }),
    db
      .collection("chat_sessions")
      .createIndex({ id: 1, userId: 1 }, { unique: true }),
    db
      .collection("daily_usage")
      .createIndex({ userId: 1, day: 1 }, { unique: true }),
    db.collection("user_cooldowns").createIndex({ userId: 1 }, { unique: true }),
  ]);
}
