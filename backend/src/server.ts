import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { connectDB } from './config/database';
import User from './models/User';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

async function ensureSparseUniqueIndexes() {
  const coll = User.collection;
  await User.createCollection().catch(() => {});

  // Sync schema-defined indexes first (agency_code, role). This also drops any indexes
  // not in the schema (e.g. old email_1/phone_number_1 if they were ever in the schema).
  await User.syncIndexes().catch(() => {});

  // Drop email/phone indexes by name in case they still exist (e.g. created by a previous run
  // or by another process). List indexes so we drop by exact name.
  const indexes = await coll.indexes().catch(() => [] as { name: string; key?: Record<string, number> }[]);
  for (const idx of indexes) {
    if (idx.name && idx.key && ('phone_number' in idx.key || 'email' in idx.key)) {
      await coll.dropIndex(idx.name).catch(() => {});
    }
  }
  await coll.dropIndex('phone_number_1').catch(() => {});
  await coll.dropIndex('email_1').catch(() => {});

  // Create sparse unique indexes so multiple users can have null email or null phone.
  // Use partialFilterExpression so only non-null values are indexed (avoids E11000 on null).
  await coll.createIndex(
    { phone_number: 1 },
    { unique: true, name: 'phone_number_1', partialFilterExpression: { phone_number: { $type: 'string' } } }
  );
  await coll.createIndex(
    { email: 1 },
    { unique: true, name: 'email_1', partialFilterExpression: { email: { $type: 'string' } } }
  );
}

async function startServer() {
  try {
    await connectDB();
    await ensureSparseUniqueIndexes();
    const env = process.env.NODE_ENV || 'development';
    console.log('\n--- ServicePulse Backend ---');
    console.log(`Server:  OK  (port ${PORT}, ${env})`);
    console.log('DB:      OK  (MongoDB)');
    console.log('----------------------------\n');
    app.listen(PORT);
  } catch (err: any) {
    console.error('\n--- ServicePulse Backend ---');
    console.error('DB:      ERROR  (MongoDB)');
    console.error(`         ${err?.message || err}`);
    console.error('Server:  NOT STARTED (database connection required)\n');
    process.exit(1);
  }
}

startServer();
