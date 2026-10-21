import { Db, MongoClient } from "mongodb";

const globalMongo = globalThis as typeof globalThis & {
  galleryMongoClientPromise?: Promise<MongoClient>;
};

function getMongoConfig() {
  const uri = process.env.MONGODB_URI?.trim();
  const databaseName =
    process.env.MONGODB_DB_NAME?.trim() || "kermanatari_gallery";

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  return { uri, databaseName };
}

export async function getMongoClient(): Promise<MongoClient> {
  const { uri } = getMongoConfig();

  if (!globalMongo.galleryMongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5_000,
    });

    globalMongo.galleryMongoClientPromise = client.connect().catch((error) => {
      globalMongo.galleryMongoClientPromise = undefined;
      throw error;
    });
  }

  return globalMongo.galleryMongoClientPromise;
}

export async function getDatabase(): Promise<Db> {
  const { databaseName } = getMongoConfig();
  const client = await getMongoClient();
  return client.db(databaseName);
}
