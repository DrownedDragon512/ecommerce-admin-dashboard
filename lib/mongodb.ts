import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "ecommerce";

if (!uri) {
  throw new Error("MONGODB_URI is not set. Add it to your .env.local file.");
}

const opts = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

declare global {
  // eslint-disable-next-line no-var
  var _mongo: Promise<MongoClient> | undefined;
}

let prm: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongo) {
    const cli = new MongoClient(uri, opts);
    global._mongo = cli.connect();
  }
  prm = global._mongo;
} else {
  const cli = new MongoClient(uri, opts);
  prm = cli.connect();
}

export async function getDb() {
  const conn = await prm;
  return conn.db(dbName);
}