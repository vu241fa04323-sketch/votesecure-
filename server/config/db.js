const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // In non-production environments, if MONGODB_URI is absent or configured to default placeholder,
    // spin up an in-memory MongoDB instance to provide zero-config instant local execution.
    if (!mongoUri || mongoUri.includes('YOUR_MONGODB_ATLAS_CONNECTION_STRING')) {
      console.log('⚡ No active MongoDB URI detected. Initializing in-memory MongoDB instance...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        mongoUri = mongodInstance.getUri();
        console.log(`✅ In-memory MongoDB started at: ${mongoUri}`);
      } catch (memErr) {
        console.warn('⚠️ Unable to start MongoMemoryServer, falling back to local mongodb://127.0.0.1:27017/votesecure');
        mongoUri = 'mongodb://127.0.0.1:27017/votesecure';
      }
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // If external URI failed in development mode, try local memory server fallback
    if (process.env.NODE_ENV !== 'production' && !mongodInstance) {
      console.log('🔄 Attempting fallback to in-memory database for local evaluation...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const fallbackUri = mongodInstance.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ Connected to fallback In-Memory MongoDB: ${fallbackUri}`);
        return conn;
      } catch (err) {
        console.error('❌ Fallback connection failed:', err.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
