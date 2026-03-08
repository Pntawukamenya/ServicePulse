import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User';
import OtpVerification from '../models/OtpVerification';
import PasswordResetOtp from '../models/PasswordResetOtp';
import { generateToken } from '../utils/jwt';
import { sendSMS } from '../config/sms';
import { sendEmail } from '../config/email';
import { getAgencyByCode } from './agencyService';

export type IdentifierType = 'email' | 'phone';
export type UserRole = 'citizen' | 'agency_employee' | 'agency_admin' | 'super_admin' | 'agency' | 'admin';

export interface RegisterData {
  identifier: string;
  /** Optional: if not provided or inconsistent with identifier, detected automatically */
  identifierType?: IdentifierType;
  password: string;
  role: 'citizen' | 'agency_employee';
  agencyCode?: string;
  agencyRole?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_MIN_DIGITS = 9;

/** Detect whether the user entered an email or phone number. Validates format. */
export function detectIdentifierType(identifier: string): IdentifierType {
  const trimmed = identifier.trim();
  if (!trimmed) throw new Error('Email or phone number is required');
  if (EMAIL_REGEX.test(trimmed)) return 'email';
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= PHONE_MIN_DIGITS) return 'phone';
  throw new Error('Please enter a valid email address or phone number');
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

async function sendPasswordResetOtp(identifier: string, identifierType: IdentifierType, otp: string): Promise<void> {
  if (identifierType === 'phone') {
    const phone = normalizePhone(identifier);
    await sendSMS(phone, `ServicePulse password reset code: ${otp}. Valid for 10 minutes. Do not share.`);
  } else {
    await sendEmail({
      to: identifier.trim().toLowerCase(),
      subject: 'ServicePulse - Password Reset Code',
      text: `Your ServicePulse password reset code is: ${otp}\n\nValid for 10 minutes. Do not share this code.\n\nIf you didn't request a password reset, please ignore this email.`,
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
    agencyRole: u.agency_role ?? null,
    avatarUrl: u.avatar_url ?? null,
  };
}

export async function registerUser(data: RegisterData) {
  const { identifier, password, role, agencyCode, agencyRole, district, sector, cell, village, termsAccepted } = data;

  if (!termsAccepted) {
    throw new Error('Terms and conditions must be accepted');
  }

  const detectedType = detectIdentifierType(identifier);
  const identifierType = (data.identifierType && data.identifierType === detectedType) ? data.identifierType : detectedType;

  const email = identifierType === 'email' ? identifier.trim().toLowerCase() : null;
  const phoneNumber = identifierType === 'phone' ? normalizePhone(identifier) : null;

  const existingUser = await User.findOne(
    email ? { email } : { phone_number: phoneNumber! }
  ).lean();

  if (existingUser) {
    throw new Error(identifierType === 'email' ? 'User with this email already exists' : 'User with this phone number already exists');
  }

  if (role === 'agency_employee' && agencyCode?.trim()) {
    const agency = await getAgencyByCode(agencyCode.trim());
    if (!agency) {
      throw new Error('Invalid agency code. Please choose a valid agency (e.g. REG, WASAC, EMERGENCY).');
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const status = role === 'citizen' ? 'pending_otp' : 'pending_approval';
  let location: string | null = null;
  if (role === 'citizen' && district && sector) {
    const parts = [district.trim(), sector.trim()];
    if (cell?.trim()) parts.push(cell.trim());
    if (village?.trim()) parts.push(village.trim());
    location = parts.join(', ');
  }

  const user = await User.create({
    email,
    phone_number: phoneNumber,
    password_hash: hashedPassword,
    full_name: null,
    location,
    identifier_type: identifierType,
    role,
    agency_code: agencyCode?.trim() || null,
    agency_role: role === 'agency_employee' && agencyRole ? agencyRole.trim() : null,
    status,
    terms_accepted: true,
  });

  if (role === 'citizen') {
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OtpVerification.create({
      identifier: (identifierType === 'email' ? email : phoneNumber)!,
      identifier_type: identifierType,
      otp_code_hash: otpHash,
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

  const candidates = await OtpVerification.find({
    identifier: lookupId,
    identifier_type: identifierType,
    used_at: null,
    expires_at: { $gte: new Date() },
  })
    .sort({ created_at: -1 })
    .lean();

  let otpRecord: { _id: any } | null = null;
  for (const c of candidates) {
    const hash = (c as any).otp_code_hash;
    if (!hash) continue; // skip legacy plain-text records
    const match = await bcrypt.compare(otp, hash);
    if (match) {
      otpRecord = c;
      break;
    }
  }

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
    { returnDocument: 'after' }
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
    throw new Error('Invalid email/phone or password');
  }

  if (user.status === 'pending_otp') {
    throw new Error('Please verify your account first. Check your ' + (user.identifier_type === 'email' ? 'email' : 'phone') + ' for the code.');
  }

  if (user.status === 'pending_approval') {
    throw new Error('Your account is pending approval by your agency admin.');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid email/phone or password');
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

export async function requestPasswordReset(identifier: string): Promise<void> {
  const isEmail = identifier.includes('@');
  const identifierType: IdentifierType = isEmail ? 'email' : 'phone';
  const email = isEmail ? identifier.trim().toLowerCase() : null;
  const phoneNumber = !isEmail ? normalizePhone(identifier) : null;
  const lookupId = email || phoneNumber;

  const user = await User.findOne(
    email ? { email } : { phone_number: phoneNumber }
  ).lean();

  // Only send OTP if account exists - but don't reveal in response
  if (!user) return;

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await PasswordResetOtp.create({
    identifier: lookupId!,
    identifier_type: identifierType,
    otp_code_hash: otpHash,
    expires_at: expiresAt,
  });

  await sendPasswordResetOtp(identifier, identifierType, otp);
}

export async function requestSignInOtp(identifier: string): Promise<void> {
  const isEmail = identifier.includes('@');
  const identifierType: IdentifierType = isEmail ? 'email' : 'phone';
  const email = isEmail ? identifier.trim().toLowerCase() : null;
  const phoneNumber = !isEmail ? normalizePhone(identifier) : null;
  const lookupId = email || phoneNumber;

  const user = await User.findOne(
    email ? { email } : { phone_number: phoneNumber }
  ).lean();

  if (!user) {
    throw new Error('Account not found');
  }

  if (user.status !== 'active') {
    throw new Error('Account is not active. Please verify your account first.');
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Use OtpVerification for sign-in (similar to registration)
  await OtpVerification.create({
    identifier: lookupId!,
    identifier_type: identifierType,
    otp_code_hash: otpHash,
    expires_at: expiresAt,
  });

  await sendOtpToIdentifier(identifier, identifierType, otp);
}

export async function signInWithOtp(data: VerifyOtpData) {
  const { identifier, identifierType, otp } = data;

  const email = identifierType === 'email' ? identifier.trim().toLowerCase() : null;
  const phoneNumber = identifierType === 'phone' ? normalizePhone(identifier) : null;
  const lookupId = email || phoneNumber;

  const candidates = await OtpVerification.find({
    identifier: lookupId,
    identifier_type: identifierType,
    used_at: null,
    expires_at: { $gte: new Date() },
  })
    .sort({ created_at: -1 })
    .lean();

  let otpRecord: { _id: any } | null = null;
  for (const c of candidates) {
    const hash = (c as any).otp_code_hash;
    if (!hash) continue;
    const match = await bcrypt.compare(otp, hash);
    if (match) {
      otpRecord = c;
      break;
    }
  }

  if (!otpRecord) {
    throw new Error('Invalid or expired verification code');
  }

  await OtpVerification.updateOne(
    { _id: otpRecord._id },
    { $set: { used_at: new Date() } }
  );

  const user = await User.findOne(
    identifierType === 'email' ? { email: lookupId } : { phone_number: lookupId }
  ).lean();

  if (!user || user.status !== 'active') {
    throw new Error('Account not found or not active');
  }

  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
    agencyId: user.agency_id?.toString(),
    agencyCode: user.agency_code || undefined,
  });

  return {
    user: formatUser(user),
    token,
  };
}

/**
 * Register user via USSD (no OTP required - phone already verified by telecom)
 */
export async function registerUserUssd(data: RegisterData & { fullName?: string }) {
  const { identifier, identifierType, password, role, agencyCode, district, sector, cell, village, termsAccepted, fullName } = data;

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
  let location: string | null = null;
  if (role === 'citizen' && district && sector) {
    const parts = [district.trim(), sector.trim()];
    if (cell?.trim()) parts.push(cell.trim());
    if (village?.trim()) parts.push(village.trim());
    location = parts.join(', ');
  }

  // For USSD, create account as 'active' immediately (phone verified by telecom)
  const user = await User.create({
    email,
    phone_number: phoneNumber,
    password_hash: hashedPassword,
    full_name: fullName || null,
    location,
    identifier_type: identifierType,
    role,
    agency_code: agencyCode || null,
    status: 'active', // Directly active for USSD users
    terms_accepted: true,
    sms_opt_in: true, // Auto-opt-in for USSD users
  });

  const token = generateToken({
    userId: user.id,
    role: user.role,
    agencyId: user.agency_id?.toString(),
    agencyCode: user.agency_code || undefined,
  });

  return {
    user: formatUser(user),
    token,
    requiresOtp: false,
  };
}

/**
 * Sign in via USSD (no OTP required - phone number is authentication)
 */
export async function signInUssd(phoneNumber: string) {
  const normalizedPhone = normalizePhone(phoneNumber);

  const user = await User.findOne({ phone_number: normalizedPhone }).lean();

  if (!user) {
    throw new Error('Account not found. Please sign up first.');
  }

  if (user.status !== 'active') {
    throw new Error('Account is not active. Please contact support.');
  }

  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
    agencyId: user.agency_id?.toString(),
    agencyCode: user.agency_code || undefined,
  });

  return {
    user: formatUser(user),
    token,
  };
}

export async function resetPasswordWithOtp(
  identifier: string,
  otp: string,
  newPassword: string
): Promise<void> {
  const isEmail = identifier.includes('@');
  const identifierType: IdentifierType = isEmail ? 'email' : 'phone';
  const email = isEmail ? identifier.trim().toLowerCase() : null;
  const phoneNumber = !isEmail ? normalizePhone(identifier) : null;
  const lookupId = email || phoneNumber;

  const candidates = await PasswordResetOtp.find({
    identifier: lookupId,
    identifier_type: identifierType,
    used_at: null,
    expires_at: { $gte: new Date() },
  })
    .sort({ created_at: -1 })
    .lean();

  let otpRecord: { _id: any } | null = null;
  for (const c of candidates) {
    const hash = (c as any).otp_code_hash;
    if (!hash) continue; // skip legacy plain-text records
    const match = await bcrypt.compare(otp, hash);
    if (match) {
      otpRecord = c;
      break;
    }
  }

  if (!otpRecord) {
    throw new Error('Invalid or expired reset code. Please request a new one.');
  }

  const user = await User.findOne(
    email ? { email: lookupId } : { phone_number: lookupId }
  ).lean();

  if (!user) {
    throw new Error('Account not found');
  }

  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await PasswordResetOtp.updateOne(
    { _id: otpRecord._id },
    { $set: { used_at: new Date() } }
  );

  await User.updateOne(
    { _id: user._id },
    { $set: { password_hash: hashedPassword } }
  );
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
  const user = await User.findById(userId).select('password_hash').lean();
  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { $set: { password_hash: hashedPassword } });
}

export async function getUserById(userId: string) {
  const user = await User.findById(userId)
    .select('email full_name phone_number location role agency_id agency_code agency_role sms_opt_in identifier_type status avatar_url created_at')
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
