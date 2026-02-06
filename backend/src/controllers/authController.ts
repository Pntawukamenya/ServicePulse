import { Request, Response } from 'express';
import { registerUser, loginUser, verifyOtpAndLogin, getUserById } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { logError } from '../utils/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(400).json({ error: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await verifyOtpAndLogin(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(401).json({ error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await getUserById(req.userId);
    res.status(200).json(user);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(404).json({ error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { supabase } = await import('../config/database');
    const { full_name, email, phone_number, location, sms_opt_in, avatar_url } = req.body;

    const updates: Record<string, any> = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (email !== undefined) updates.email = email;
    if (phone_number !== undefined) updates.phone_number = phone_number;
    if (location !== undefined) updates.location = location;
    if (sms_opt_in !== undefined) updates.sms_opt_in = sms_opt_in;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url === '' ? null : avatar_url;

    const { data: currentUser } = await supabase.from('users').select('email, phone_number').eq('id', req.userId).single();
    if (currentUser) {
      const newEmail = email !== undefined ? email : currentUser.email;
      const newPhone = phone_number !== undefined ? phone_number : currentUser.phone_number;
      if (!newEmail && !newPhone) {
        res.status(400).json({ error: 'At least one of email or phone number is required' });
        return;
      }
    }

    let { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();

    // If avatar_url column doesn't exist, retry without it
    if (error && (error.message?.includes('avatar_url') || (error as any).code === '42703')) {
      delete updates.avatar_url;
      const retry = await supabase.from('users').update(updates).eq('id', req.userId).select().single();
      user = retry.data;
      error = retry.error;
    }

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    res.status(200).json(user);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(400).json({ error: error.message });
  }
};
