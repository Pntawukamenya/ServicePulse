import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getPendingApprovals, approveUser } from '../services/approvalService';
import { logError } from '../utils/logger';

export const listPending = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const agencyCode = req.userAgencyCode;
    if (!agencyCode) {
      res.status(403).json({ error: 'Agency admin access required' });
      return;
    }

    const pending = await getPendingApprovals(agencyCode);
    res.json(pending);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(400).json({ error: error.message });
  }
};

export const approve = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const agencyCode = req.userAgencyCode;
    const userId = req.params.userId;

    if (!agencyCode || !req.userId) {
      res.status(403).json({ error: 'Agency admin access required' });
      return;
    }

    const user = await approveUser(userId, req.userId, agencyCode);
    res.json(user);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(400).json({ error: error.message });
  }
};
