/**
 * Seed script for ServicePulse MongoDB
 * Creates agencies (REG, WASAC, Emergency) and admin users
 * Run with: npm run seed
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Agency from '../models/Agency';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI === 'your_mongodb_connection_string') {
  console.error('❌ Set MONGODB_URI in .env before running seed');
  process.exit(1);
}

const AGENCIES = [
  { name: 'Energy Utility Corporation (REG)', code: 'REG' },
  { name: 'Water and Sanitation Corporation (WASAC)', code: 'WASAC' },
  { name: 'Emergency Services', code: 'EMERGENCY' },
];

const ADMIN_CREDENTIALS = [
  { email: 'admin@servicepulse.com', password: 'Admin@24!', role: 'super_admin' as const, agencyCode: null },
  { email: 'reg@servicepulse.com', password: 'Reg@24!', role: 'agency_admin' as const, agencyCode: 'REG' },
  { email: 'wasac@servicepulse.com', password: 'Wasac@24!', role: 'agency_admin' as const, agencyCode: 'WASAC' },
  { email: 'emergency@servicepulse.com', password: 'Emer@24!', role: 'agency_admin' as const, agencyCode: 'EMERGENCY' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('MongoDB connected\n');

    // Create agencies
    for (const agency of AGENCIES) {
      await Agency.findOneAndUpdate(
        { code: agency.code },
        { $set: { name: agency.name } },
        { upsert: true, new: true }
      );
      console.log(`✓ Agency ${agency.code} ready`);
    }

    // Create/update admin users
    const hashedPassword = await bcrypt.hash('Admin@24!', 10);
    for (const cred of ADMIN_CREDENTIALS) {
      const passwordHash = cred.role === 'super_admin'
        ? hashedPassword
        : await bcrypt.hash(cred.password, 10);

      const agency = cred.agencyCode
        ? await Agency.findOne({ code: cred.agencyCode }).select('_id').lean()
        : null;

      await User.findOneAndUpdate(
        { email: cred.email },
        {
          $set: {
            email: cred.email,
            password_hash: passwordHash,
            full_name: cred.role === 'super_admin' ? 'Super Administrator' : `${cred.agencyCode} Admin`,
            identifier_type: 'email',
            role: cred.role,
            agency_id: agency?._id || null,
            agency_code: cred.agencyCode,
            status: 'active',
            terms_accepted: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✓ Admin ${cred.email} ready`);
    }

    console.log('\nSeed complete. You can log in with:');
    console.log('  admin@servicepulse.com / Admin@24!');
    console.log('  reg@servicepulse.com / Reg@24!');
    console.log('  wasac@servicepulse.com / Wasac@24!');
    console.log('  emergency@servicepulse.com / Emer@24!\n');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
