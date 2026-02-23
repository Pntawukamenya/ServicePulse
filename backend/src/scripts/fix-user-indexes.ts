/**
 * One-time script to fix users collection indexes so email-only and phone-only
 * registration work (sparse unique indexes on email and phone_number).
 * Run: npm run fix:indexes
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI || MONGODB_URI === 'your_mongodb_connection_string') {
  console.error('Set MONGODB_URI in .env');
  process.exit(1);
}
const URI = MONGODB_URI;

async function main() {
  await mongoose.connect(URI);
  const coll = User.collection;
  await User.createCollection().catch(() => {});

  const list = await coll.indexes().catch(() => [] as { name: string; key?: Record<string, number> }[]);

  const dropByKey = async (key: string) => {
    const idx = list.find((i) => i.key && key in i.key);
    if (idx?.name) {
      await coll.dropIndex(idx.name).catch(() => {});
      console.log(`Dropped index: ${idx.name}`);
    }
    await coll.dropIndex(key + '_1').catch(() => {});
  };

  await dropByKey('phone_number');
  await coll.createIndex(
    { phone_number: 1 },
    { unique: true, name: 'phone_number_1', partialFilterExpression: { phone_number: { $type: 'string' } } }
  );
  console.log('Created unique partial index: phone_number_1');

  await dropByKey('email');
  await coll.createIndex(
    { email: 1 },
    { unique: true, name: 'email_1', partialFilterExpression: { email: { $type: 'string' } } }
  );
  console.log('Created unique partial index: email_1');

  await mongoose.disconnect();
  console.log('Done. You can now register with email only or phone only.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
