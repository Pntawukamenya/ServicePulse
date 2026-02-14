import { Request, Response } from 'express';
import { registerUser, loginUser, verifyOtpAndLogin, getUserById } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { logError } from '../utils/logger';
import User from '../models/User';

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

    const { full_name, email, phone_number, location, sms_opt_in, avatar_url } = req.body;

    const currentUser = await User.findById(req.userId).select('email phone_number').lean();
    if (currentUser) {
      const newEmail = email !== undefined ? email : currentUser.email;
      const newPhone = phone_number !== undefined ? phone_number : currentUser.phone_number;
      if (!newEmail && !newPhone) {
        res.status(400).json({ error: 'At least one of email or phone number is required' });
        return;
      }
    }

    const updates: Record<string, any> = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (email !== undefined) updates.email = email;
    if (phone_number !== undefined) updates.phone_number = phone_number;
    if (location !== undefined) updates.location = location;
    if (sms_opt_in !== undefined) updates.sms_opt_in = sms_opt_in;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url === '' ? null : avatar_url;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    ).lean();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      ...user,
      id: user._id.toString(),
      agency_id: user.agency_id?.toString() || user.agency_id,
    });
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(400).json({ error: error.message });
  }
};
