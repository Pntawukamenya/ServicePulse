/**
 * Seed sample reports and notifications for ServicePulse demo/presentation
 * Run: npm run seed:reports          (skips if data exists)
 * Run: npm run seed:reports -- --force   (clears & re-seeds sample data)
 *
 * Creates:
 * - 3 demo citizen users (if none exist)
 * - 12 sample reports (4 per agency: REG, WASAC, EMERGENCY)
 * - 6 sample notifications/alerts (2 per agency)
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Agency from '../models/Agency';
import Report from '../models/Report';
import Notification from '../models/Notification';

const MONGODB_URI = process.env.MONGODB_URI;
const FORCE = process.argv.includes('--force');

if (!MONGODB_URI || MONGODB_URI === 'your_mongodb_connection_string') {
  console.error('❌ Set MONGODB_URI in .env before running seed');
  process.exit(1);
}

// Demo citizens - used when no citizen users exist
const DEMO_CITIZENS = [
  { email: 'citizen1@demo.rw', phone: '+250788111001', fullName: 'Jean Claude Uwimana', location: 'Gasabo, Remera' },
  { email: 'citizen2@demo.rw', phone: '+250788222002', fullName: 'Marie Uwera', location: 'Kicukiro, Gikondo' },
  { email: 'citizen3@demo.rw', phone: '+250788333003', fullName: 'Patrick Niyonzima', location: 'Nyarugenge, Nyamirambo' },
];

// Sample reports - realistic Rwanda citizen issues per agency
const SAMPLE_REPORTS: Array<{
  agencyCode: 'REG' | 'WASAC' | 'EMERGENCY';
  serviceType: string;
  location: string;
  description: string;
  status: 'received' | 'in_progress' | 'resolved';
}> = [
  // REG - Electricity (3 reports)
  {
    agencyCode: 'REG',
    serviceType: 'REG_POWER_OUTAGE',
    location: 'Gasabo, Remera',
    description: 'No electricity since 6am. Whole neighborhood dark. Transformers near Remera market. Please restore power urgently.',
    status: 'resolved',
  },
  {
    agencyCode: 'REG',
    serviceType: 'REG_METER_ISSUE',
    location: 'Kicukiro, Gikondo',
    description: 'Meter display is broken and not showing consumption. Need replacement. House number KG 123.',
    status: 'in_progress',
  },
  {
    agencyCode: 'REG',
    serviceType: 'REG_TRANSFORMER_FAULT',
    location: 'Nyarugenge, Nyamirambo',
    description: 'Transformer making loud noise and sparking near Nyamirambo center. Safety hazard. Urgent repair needed.',
    status: 'received',
  },
  {
    agencyCode: 'REG',
    serviceType: 'REG_LOAD_SHEDDING',
    location: 'Gasabo, Ndera',
    description: 'Unexpected power cuts every evening for 2 weeks. No schedule communicated. Affecting businesses.',
    status: 'received',
  },
  // WASAC - Water (3 reports)
  {
    agencyCode: 'WASAC',
    serviceType: 'WASAC_PIPE_BURST',
    location: 'Gasabo, Kimironko',
    description: 'Water gushing from broken pipe on KG 11 Ave. Wasting water for 2 days. Road flooded.',
    status: 'resolved',
  },
  {
    agencyCode: 'WASAC',
    serviceType: 'WASAC_LOW_PRESSURE',
    location: 'Nyarugenge, Muhima',
    description: 'Water pressure very low for 3 days. Cannot shower or fill tank. Whole building affected.',
    status: 'in_progress',
  },
  {
    agencyCode: 'WASAC',
    serviceType: 'WASAS_WATER_QUALITY',
    location: 'Kicukiro, Kigarama',
    description: 'Brown and cloudy water from tap since yesterday. Unsafe to drink. Reported by several neighbors.',
    status: 'received',
  },
  {
    agencyCode: 'WASAC',
    serviceType: 'WASAC_SEWAGE',
    location: 'Nyarugenge, Rwezamenyo',
    description: 'Sewage backup in street. Bad smell and health risk. Manhole overflowing. Needs urgent fix.',
    status: 'received',
  },
  // EMERGENCY (3 reports)
  {
    agencyCode: 'EMERGENCY',
    serviceType: 'EMERGENCY_CRIME',
    location: 'Gasabo, Remera',
    description: 'Break-in attempted last night around 2am. Suspect fled. Burglary tools found. Need police report.',
    status: 'resolved',
  },
  {
    agencyCode: 'EMERGENCY',
    serviceType: 'EMERGENCY_FIRE',
    location: 'Kicukiro, Gikondo',
    description: 'Bush fire near residential area. Risk of spreading to houses. Fire brigade needed urgently.',
    status: 'in_progress',
  },
  {
    agencyCode: 'EMERGENCY',
    serviceType: 'EMERGENCY_AMBULANCE',
    location: 'Nyarugenge, Nyamirambo',
    description: 'Road accident at Nyamirambo junction. Two people injured. Ambulance and police needed.',
    status: 'resolved',
  },
  {
    agencyCode: 'EMERGENCY',
    serviceType: 'EMERGENCY_POLICE',
    location: 'Gasabo, Ndera',
    description: 'Suspicious individuals harassing vendors. Theft reported. Request police patrol increase.',
    status: 'received',
  },
];

// Fix typo: WASAS_WATER_QUALITY -> WASAC_WATER_QUALITY
const reports = SAMPLE_REPORTS.map((r) =>
  r.serviceType === 'WASAS_WATER_QUALITY' ? { ...r, serviceType: 'WASAC_WATER_QUALITY' } : r
);

// Sample notifications/alerts per agency
const SAMPLE_NOTIFICATIONS: Array<{
  agencyCode: 'REG' | 'WASAC' | 'EMERGENCY';
  serviceType: string;
  location: string | null;
  message: string;
  targetAudience: 'all' | 'location_based';
  deliveryCount: number;
  totalRecipients: number;
}> = [
  // REG alerts
  {
    agencyCode: 'REG',
    serviceType: 'REG_POWER_OUTAGE',
    location: 'Gasabo, Remera',
    message: 'REG: Planned maintenance Remera sector Tue 8am-2pm. Power will be off. We apologize for inconvenience.',
    targetAudience: 'location_based',
    deliveryCount: 450,
    totalRecipients: 512,
  },
  {
    agencyCode: 'REG',
    serviceType: 'REG_LOAD_SHEDDING',
    location: null,
    message: 'REG: Load shedding schedule for Kigali today. Zone A: 6-9am, Zone B: 12-3pm. Check REG app for details.',
    targetAudience: 'all',
    deliveryCount: 2340,
    totalRecipients: 2500,
  },
  // WASAC alerts
  {
    agencyCode: 'WASAC',
    serviceType: 'WASAC_PIPE_BURST',
    location: 'Nyarugenge, Nyamirambo',
    message: 'WASAC: Emergency repair Nyamirambo. Water may be interrupted 2-4pm. Store water. Updates via SMS.',
    targetAudience: 'location_based',
    deliveryCount: 320,
    totalRecipients: 380,
  },
  {
    agencyCode: 'WASAC',
    serviceType: 'WASAC_WATER_QUALITY',
    location: null,
    message: 'WASAC: Boil water advisory Kicukiro until further notice. Treatment plant maintenance. Your safety first.',
    targetAudience: 'all',
    deliveryCount: 1800,
    totalRecipients: 1900,
  },
  // EMERGENCY alerts
  {
    agencyCode: 'EMERGENCY',
    serviceType: 'EMERGENCY_DISASTER',
    location: 'Rubavu, Rubavu',
    message: 'ALERT: Heavy rain forecast Rubavu. Risk of flooding. Move to higher ground. Emergency line 112.',
    targetAudience: 'location_based',
    deliveryCount: 1200,
    totalRecipients: 1250,
  },
  {
    agencyCode: 'EMERGENCY',
    serviceType: 'EMERGENCY_POLICE',
    location: null,
    message: 'Police: Report any suspicious activity. Call 112 or 3512. Your vigilance keeps communities safe.',
    targetAudience: 'all',
    deliveryCount: 5200,
    totalRecipients: 5500,
  },
];

async function seedReports() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('MongoDB connected\n');

    // Get agencies
    const agencies = await Agency.find({ code: { $in: ['REG', 'WASAC', 'EMERGENCY'] } }).lean();
    if (agencies.length < 3) {
      console.error('❌ Run npm run seed first to create agencies');
      process.exit(1);
    }
    const agencyMap = Object.fromEntries(agencies.map((a) => [a.code, a._id]));

    // Get or create citizen users
    let citizenUsers = await User.find({ role: 'citizen', status: 'active' }).select('_id').limit(3).lean();
    if (citizenUsers.length === 0) {
      console.log('No citizen users found. Creating demo citizens...');
      const hashedPassword = await bcrypt.hash('Demo@2024!', 10);
      for (const c of DEMO_CITIZENS) {
        const user = await User.create({
          email: c.email,
          phone_number: c.phone,
          password_hash: hashedPassword,
          full_name: c.fullName,
          location: c.location,
          identifier_type: 'email',
          role: 'citizen',
          status: 'active',
          terms_accepted: true,
        });
        citizenUsers.push({ _id: user._id });
      }
      console.log(`✓ Created ${citizenUsers.length} demo citizens (password: Demo@2024!)\n`);
    } else {
      console.log(`✓ Using ${citizenUsers.length} existing citizen(s)\n`);
    }

    // Optional: clear existing sample data before seeding
    const sampleDescs = reports.map((r) => r.description);
    const sampleMsgs = SAMPLE_NOTIFICATIONS.map((n) => n.message);
    if (FORCE) {
      const delReports = await Report.deleteMany({ description: { $in: sampleDescs } });
      const delNotifs = await Notification.deleteMany({ message: { $in: sampleMsgs } });
      console.log(`Force: removed ${delReports.deletedCount} reports, ${delNotifs.deletedCount} notifications\n`);
    }

    // Seed reports (skip if same description exists and not --force)
    const existingDescs = FORCE ? [] : await Report.distinct('description');
    let reportCount = 0;
    for (let i = 0; i < reports.length; i++) {
      const r = reports[i];
      if (existingDescs.includes(r.description)) continue;
      const userId = citizenUsers[i % citizenUsers.length]._id;
      await Report.create({
        user_id: userId,
        service_type: r.serviceType,
        location: r.location,
        description: r.description,
        status: r.status,
      });
      reportCount++;
    }
    console.log(`✓ Seeded ${reportCount} sample reports\n`);

    // Seed notifications (skip if same message exists and not --force)
    const existingMsgs = FORCE ? [] : await Notification.distinct('message');
    let notifCount = 0;
    for (const n of SAMPLE_NOTIFICATIONS) {
      if (existingMsgs.includes(n.message)) continue;
      const agencyId = agencyMap[n.agencyCode];
      if (!agencyId) continue;
      await Notification.create({
        agency_id: agencyId,
        service_type: n.serviceType,
        location: n.location,
        message: n.message,
        target_audience: n.targetAudience,
        delivery_count: n.deliveryCount,
        total_recipients: n.totalRecipients,
      });
      notifCount++;
    }
    console.log(`✓ Seeded ${notifCount} sample notifications/alerts\n`);

    console.log('Seed reports complete. Sample data ready for demo.\n');
  } catch (err) {
    console.error('Seed reports failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedReports();
