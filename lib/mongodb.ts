import { Db, MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error(`Invalid env variable MONGODB_URI: ${process.env.MONGODB_URI}`);
}

if (!process.env.MONGODB_DATABASE) {
  throw new Error(`Invalid env variable MONGODB_DATABASE: ${process.env.MONGODB_DATABASE}`);
}

declare const global: {
  _mongoClientPromise: Promise<MongoClient>;
  _mongoDbPromise: Promise<Db>;
};

const uri = process.env.MONGODB_URI;
const database = process.env.MONGODB_DATABASE;
const options = {};

let clientPromise: Promise<MongoClient>;
let dbPromise: Promise<Db>;

const createClientPromise = async (): Promise<MongoClient> => {
  const client = new MongoClient(uri, options);
  return client.connect();
};

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
  clientPromise = global._mongoClientPromise;
  dbPromise = global._mongoClientPromise.then(client => client.db(database));
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = createClientPromise();
  dbPromise = clientPromise.then(client => client.db(database));
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export { clientPromise, dbPromise };
