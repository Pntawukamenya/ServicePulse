import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User';
import OtpVerification from '../models/OtpVerification';
import { generateToken } from '../utils/jwt';
import { sendSMS } from '../config/sms';
import { sendEmail } from '../config/email';

export type IdentifierType = 'email' | 'phone';
export type UserRole = 'citizen' | 'agency_employee' | 'agency_admin' | 'super_admin' | 'agency' | 'admin';

export interface RegisterData {
  identifier: string;
  identifierType: IdentifierType;
  password: string;
  role: 'citizen' | 'agency_employee';
  agencyCode?: string;
  termsAccepted: boolean;
}

export interface LoginData {
  identifier: string;
  password: string;
}

export interface VerifyOtpData {
  identifier: string;
  identifierType: IdentifierType;
  otp: string;
}

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function normalizePhone(phone: string): string {
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('250')) return `+${p}`;
  if (p.startsWith('0')) return '+250' + p.slice(1);
  return '+250' + p;
}

async function sendOtpToIdentifier(identifier: string, identifierType: IdentifierType, otp: string): Promise<void> {
  if (identifierType === 'phone') {
    const phone = normalizePhone(identifier);
    await sendSMS(phone, `ServicePulse verification code: ${otp}. Valid for 10 minutes.`);
  } else {
    await sendEmail({
      to: identifier.trim().toLowerCase(),
      subject: 'ServicePulse - Verification Code',
      text: `Your ServicePulse verification code is: ${otp}\n\nValid for 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
    });
  }
}

function formatUser(user: any) {
  const u = user.toObject ? user.toObject() : user;
  const displayName = u.full_name || u.email || u.phone_number;
  return {
    id: u._id?.toString() || u.id,
    email: u.email,
    fullName: displayName,
    phoneNumber: u.phone_number,
    role: u.role,
    agencyId: u.agency_id?.toString() || u.agency_id,
    agencyCode: u.agency_code,
    avatarUrl: u.avatar_url ?? null,
  };
}

export async function registerUser(data: RegisterData) {
  const { identifier, identifierType, password, role, agencyCode, termsAccepted } = data;

  if (!termsAccepted) {
    throw new Error('Terms and conditions must be accepted');
  }

  const email = identifierType === 'email' ? identifier.trim().toLowerCase() : null;
  const phoneNumber = identifierType === 'phone' ? normalizePhone(identifier) : null;

  const existingUser = await User.findOne(
    email ? { email } : { phone_number: phoneNumber! }
  ).lean();

  if (existingUser) {
    throw new Error(identifierType === 'email' ? 'User with this email already exists' : 'User with this phone number already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const status = role === 'citizen' ? 'pending_otp' : 'pending_approval';

  const user = await User.create({
    email,
    phone_number: phoneNumber,
    password_hash: hashedPassword,
    full_name: null,
    identifier_type: identifierType,
    role,
    agency_code: agencyCode || null,
    status,
    terms_accepted: true,
  });

  if (role === 'citizen') {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OtpVerification.create({
      identifier: (identifierType === 'email' ? email : phoneNumber)!,
      identifier_type: identifierType,
      otp_code: otp,
      expires_at: expiresAt,
    });
    await sendOtpToIdentifier(identifier, identifierType, otp);
    return {
      requiresOtp: true,
      identifier,
      identifierType,
      message: 'Check your ' + (identifierType === 'email' ? 'email' : 'phone') + ' for verification code',
    };
  }

  return {
    requiresOtp: false,
    message: 'Account created. Awaiting approval from your agency admin.',
  };
}

export async function verifyOtpAndLogin(data: VerifyOtpData) {
  const { identifier, identifierType, otp } = data;

  const email = identifierType === 'email' ? identifier.trim().toLowerCase() : null;
  const phoneNumber = identifierType === 'phone' ? normalizePhone(identifier) : null;
  const lookupId = email || phoneNumber;

  const otpRecord = await OtpVerification.findOne({
    identifier: lookupId,
    identifier_type: identifierType,
    otp_code: otp,
    used_at: null,
    expires_at: { $gte: new Date() },
  }).sort({ created_at: -1 }).lean();

  if (!otpRecord) {
    throw new Error('Invalid or expired verification code');
  }

  await OtpVerification.updateOne(
    { _id: otpRecord._id },
    { $set: { used_at: new Date() } }
  );

  const user = await User.findOneAndUpdate(
    identifierType === 'email' ? { email: lookupId } : { phone_number: lookupId },
    { $set: { status: 'active' } },
    { new: true }
  );

  if (!user) {
    throw new Error('Verification failed');
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
    agencyId: user.agency_id?.toString(),
    agencyCode: user.agency_code || undefined,
  });

  return {
    user: formatUser(user),
    token,
  };
}

export async function loginUser(data: LoginData) {
  const { identifier, password } = data;

  const isEmail = identifier.includes('@');
  const email = isEmail ? identifier.trim().toLowerCase() : null;
  const phoneNumber = !isEmail ? normalizePhone(identifier) : null;

  const user = await User.findOne(
    email ? { email } : { phone_number: phoneNumber }
  );

  if (!user) {
    throw new Error('Invalid identifier or password');
  }

  if (user.status === 'pending_otp') {
    throw new Error('Please verify your account first. Check your ' + (user.identifier_type === 'email' ? 'email' : 'phone') + ' for the code.');
  }

  if (user.status === 'pending_approval') {
    throw new Error('Your account is pending approval by your agency admin.');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid identifier or password');
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
    agencyId: user.agency_id?.toString(),
    agencyCode: user.agency_code || undefined,
  });

  return {
    user: formatUser(user),
    token,
  };
}

export async function getUserById(userId: string) {
  const user = await User.findById(userId)
    .select('email full_name phone_number location role agency_id agency_code sms_opt_in identifier_type status avatar_url created_at')
    .lean();

  if (!user) {
    throw new Error('User not found');
  }

  return {
    ...user,
    id: user._id.toString(),
    agency_id: user.agency_id?.toString() || user.agency_id,
  };
}
