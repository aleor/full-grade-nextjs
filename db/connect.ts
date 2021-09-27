import { Db, MongoClient } from 'mongodb';

global.mongo = global.mongo || {};

export const connectToDB = async () => {
  if (!global.mongo) {
    const client = new MongoClient(process.env.DATABASE_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      bufferMaxEntries: 0,
      connectTimeoutMS: 10_000,
    });

    await global.mongo.client.connect();

    global.mongo.client = client;
  }

  const db = global.mongo.client.db('known');

  return { db, dbClient: global.mongo.client };
};
