/**
 * Seed script for MongoDB - run with: npm run seed
 * Creates agencies, super admin, and agency admins (all auto-verified)
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Agency from '../models/Agency';
import User from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

const ADMIN_CREDENTIALS = [
  {
    email: 'superadmin@servicepulse.rw',
    password: 'ServicePulse@SuperAdmin1!',
    fullName: 'Super Administrator',
    role: 'super_admin' as const,
    agencyCode: null,
    phoneNumber: '+250000000001',
  },
  {
    email: 'reg.admin@servicepulse.rw',
    password: 'ServicePulse@REG1!',
    fullName: 'REG Agency Admin',
    role: 'agency_admin' as const,
    agencyCode: 'REG',
    phoneNumber: '+250000000002',
  },
  {
    email: 'wasac.admin@servicepulse.rw',
    password: 'ServicePulse@WASAC1!',
    fullName: 'WASAC Agency Admin',
    role: 'agency_admin' as const,
    agencyCode: 'WASAC',
    phoneNumber: '+250000000003',
  },
  {
    email: 'emergency.admin@servicepulse.rw',
    password: 'ServicePulse@Emergency1!',
    fullName: 'Emergency Services Admin',
    role: 'agency_admin' as const,
    agencyCode: 'EMERGENCY',
    phoneNumber: '+250000000004',
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('Connected to MongoDB\n');

  // 1. Create agencies
  const agencies = [
    { name: 'REG - Electricity', code: 'REG' },
    { name: 'WASAC - Water', code: 'WASAC' },
    { name: 'Emergency Services', code: 'EMERGENCY' },
  ];

  const agencyMap: Record<string, mongoose.Types.ObjectId> = {};

  for (const a of agencies) {
    let agency = await Agency.findOne({ code: a.code });
    if (!agency) {
      agency = await Agency.create(a);
      console.log(`Created agency: ${a.name} (${a.code})`);
    } else {
      console.log(`Agency already exists: ${a.code}`);
    }
    agencyMap[a.code] = agency._id;
  }

  // 2. Create super admin and agency admins
  console.log('\n--- Admin Accounts ---');
  const credentialsUsed: string[] = [];

  for (const cred of ADMIN_CREDENTIALS) {
    const existing = await User.findOne({ email: cred.email });
    if (existing) {
      console.log(`User already exists: ${cred.email}`);
      credentialsUsed.push(`${cred.email} / ${cred.password} (already existed)`);
      continue;
    }

    const passwordHash = await bcrypt.hash(cred.password, 10);
    const agencyId = cred.agencyCode ? agencyMap[cred.agencyCode] : null;

    await User.create({
      email: cred.email,
      phone_number: cred.phoneNumber,
      password_hash: passwordHash,
      full_name: cred.fullName,
      identifier_type: 'email',
      role: cred.role,
      agency_id: agencyId,
      agency_code: cred.agencyCode,
      status: 'active',
      terms_accepted: true,
    });

    console.log(`Created: ${cred.fullName} (${cred.email})`);
    credentialsUsed.push(`${cred.email} / ${cred.password}`);
  }

  // 3. Print credentials
  console.log('\n========================================');
  console.log('ADMIN CREDENTIALS (save these securely)');
  console.log('========================================');
  credentialsUsed.forEach((c) => console.log(c));
  console.log('========================================\n');
  console.log('Seed complete');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
