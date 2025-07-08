const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectToDb() {
  try {
    if (!db) {
      await client.connect();
      db = client.db(); // default DB from URI
      console.log("✅ Connected to MongoDB");
    }
    return db;
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    throw err;
  }
}

module.exports = connectToDb;
