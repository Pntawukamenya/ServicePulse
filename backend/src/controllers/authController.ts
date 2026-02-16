import { Request, Response } from 'express';
import { registerUser, loginUser, verifyOtpAndLogin, getUserById, changePassword, requestPasswordReset, resetPasswordWithOtp } from '../services/authService';
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

export const changePasswordHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      res.status(400).json({ error: 'All password fields are required' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({ error: 'New password and confirmation do not match' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    await changePassword(req.userId, oldPassword, newPassword);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error: any) {
    logError(req, error.message, error);
    const status = error.message?.includes('incorrect') ? 401 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== 'string') {
      res.status(400).json({ error: 'Email or phone number is required' });
      return;
    }
    await requestPasswordReset(identifier.trim());
    // Always return success for security (don't reveal if account exists)
    res.status(200).json({
      message: 'If an account exists with that identifier, you will receive a reset code.',
      requiresOtp: true,
      identifier: identifier.trim(),
      identifierType: identifier.includes('@') ? 'email' : 'phone',
    });
  } catch (error: any) {
    logError(req, error.message, error);
    // Still return generic success to avoid revealing account existence
    res.status(200).json({
      message: 'If an account exists with that identifier, you will receive a reset code.',
      requiresOtp: true,
      identifier: req.body?.identifier?.trim(),
      identifierType: req.body?.identifier?.includes('@') ? 'email' : 'phone',
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, otp, newPassword, confirmNewPassword } = req.body;

    if (!identifier || !otp || !newPassword || !confirmNewPassword) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({ error: 'New password and confirmation do not match' });
      return;
    }

    await resetPasswordWithOtp(identifier.trim(), otp, newPassword);
    res.status(200).json({
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error: any) {
    logError(req, error.message, error);
    const status = error.message?.includes('Invalid') || error.message?.includes('expired') ? 400 : 400;
    res.status(status).json({ error: error.message });
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
