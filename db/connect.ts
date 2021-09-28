import { MongoClient } from 'mongodb';

global.mongo = global.mongo || {};

export const connectToDB = async () => {
  if (!global.mongo.client) {
    global.mongo.client = new MongoClient(process.env.DATABASE_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      bufferMaxEntries: 0,
      connectTimeoutMS: 10_000,
    });

    await global.mongo.client.connect();
  }

  const db = global.mongo.client.db(process.env.DB_NAME);

  return { db, dbClient: global.mongo.client };
};
