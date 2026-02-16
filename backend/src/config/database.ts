import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI === 'your_mongodb_connection_string') {
  console.error('\n❌ MongoDB configuration error:');
  console.error('Please set MONGODB_URI in your .env file');
  console.error('Format: mongodb://localhost:27017/servicepulse or mongodb+srv://user:pass@cluster.mongodb.net/servicepulse\n');
  throw new Error('Invalid or missing MONGODB_URI. Please configure your .env file.');
}

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

export default mongoose;
