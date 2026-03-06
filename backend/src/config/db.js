const mongoose = require('mongoose');
const runSeed = require('../seedService');

/**
 * @description Connects to MongoDB. Falls back to in-memory MongoDB if unavailable.
 */
const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 });
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.log('Local MongoDB failed. Starting In-Memory MongoDB...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            await mongoose.connect(mongoServer.getUri());
            console.log(`In-Memory MongoDB Connected: ${mongoose.connection.host}`);
            await runSeed();
        } catch (memError) {
            console.error(`Memory Server Error: ${memError.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
