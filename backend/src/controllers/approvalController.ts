import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getPendingApprovals, approveUser } from '../services/approvalService';
import { logError } from '../utils/logger';

export const listPending = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Super_admin without agency can pass ?agencyCode=REG (or WASAC, EMERGENCY) to list that agency's pending users
    const agencyCode =
      req.userAgencyCode ||
      (req.userRole === 'super_admin' ? (req.query.agencyCode as string)?.trim()?.toUpperCase() : undefined);
    if (!agencyCode) {
      res.status(403).json({ error: 'Agency admin access required. Super admin can use ?agencyCode=REG (or WASAC, EMERGENCY).' });
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
    const userId = req.params.userId;
    // Super_admin without agency can pass agencyCode in body or query to approve for that agency
    const agencyCode =
      req.userAgencyCode ||
      (req.userRole === 'super_admin'
        ? ((req.body?.agencyCode ?? req.query?.agencyCode) as string)?.trim()?.toUpperCase()
        : undefined);

    if (!agencyCode || !req.userId) {
      res.status(403).json({ error: 'Agency admin access required. Super admin can pass agencyCode in body or query.' });
      return;
    }

    const user = await approveUser(userId, req.userId, agencyCode);
    res.json(user);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(400).json({ error: error.message });
  }
};
