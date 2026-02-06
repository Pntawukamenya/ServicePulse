import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { supabase } from '../config/database';
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

export async function registerUser(data: RegisterData) {
  const { identifier, identifierType, password, role, agencyCode, termsAccepted } = data;

  if (!termsAccepted) {
    throw new Error('Terms and conditions must be accepted');
  }

  const email = identifierType === 'email' ? identifier.trim().toLowerCase() : null;
  const phoneNumber = identifierType === 'phone' ? normalizePhone(identifier) : null;

  // Check if user exists
  let existingQuery = supabase.from('users').select('id');
  if (email) existingQuery = existingQuery.eq('email', email);
  else existingQuery = existingQuery.eq('phone_number', phoneNumber);
  const { data: existingUser } = await existingQuery.single();

  if (existingUser) {
    throw new Error(identifierType === 'email' ? 'User with this email already exists' : 'User with this phone number already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const status = role === 'citizen' ? 'pending_otp' : 'pending_approval';
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: email,
      phone_number: phoneNumber,
      password_hash: hashedPassword,
      full_name: null,
      identifier_type: identifierType,
      role: role,
      agency_code: agencyCode || null,
      status,
      terms_accepted: true,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }

  if (role === 'citizen') {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await supabase.from('otp_verifications').insert({
      identifier: identifierType === 'email' ? email : phoneNumber,
      identifier_type: identifierType,
      otp_code: otp,
      expires_at: expiresAt.toISOString(),
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

  const { data: otpRecord } = await supabase
    .from('otp_verifications')
    .select('*')
    .eq('identifier', lookupId)
    .eq('identifier_type', identifierType)
    .eq('otp_code', otp)
    .is('used_at', null)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!otpRecord) {
    throw new Error('Invalid or expired verification code');
  }

  await supabase
    .from('otp_verifications')
    .update({ used_at: new Date().toISOString() })
    .eq('id', otpRecord.id);

  const { data: user } = await supabase
    .from('users')
    .update({ status: 'active' })
    .eq(identifierType === 'email' ? 'email' : 'phone_number', lookupId)
    .eq('status', 'pending_otp')
    .select()
    .single();

  if (!user) {
    throw new Error('Verification failed');
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
    agencyId: user.agency_id || undefined,
    agencyCode: user.agency_code || undefined,
  });

  return {
    user: formatUser(user),
    token,
  };
}

function formatUser(user: any) {
  const displayName = user.full_name || user.email || user.phone_number;
  return {
    id: user.id,
    email: user.email,
    fullName: displayName,
    phoneNumber: user.phone_number,
    role: user.role,
    agencyId: user.agency_id,
    agencyCode: user.agency_code,
  };
}

export async function loginUser(data: LoginData) {
  const { identifier, password } = data;

  const isEmail = identifier.includes('@');
  const email = isEmail ? identifier.trim().toLowerCase() : null;
  const phoneNumber = !isEmail ? normalizePhone(identifier) : null;

  let query = supabase.from('users').select('*');
  if (email) query = query.eq('email', email);
  else query = query.eq('phone_number', phoneNumber);
  const { data: user, error } = await query.single();

  if (error || !user) {
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
    agencyId: user.agency_id || undefined,
    agencyCode: user.agency_code || undefined,
  });

  return {
    user: formatUser(user),
    token,
  };
}

export async function getUserById(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, full_name, phone_number, location, role, agency_id, agency_code, sms_opt_in, identifier_type, status, created_at')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  return user;
}
