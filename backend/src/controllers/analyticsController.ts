import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getReportAnalytics } from '../services/analyticsService';
import { logError } from '../utils/logger';

export const reportAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const allowedRoles = ['agency', 'agency_admin', 'super_admin', 'admin'];
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      res.status(403).json({ error: 'Agency or admin access required' });
      return;
    }
    const agencyCode = req.userRole === 'super_admin' ? (req.query.agency as string) || null : req.userAgencyCode || null;
    const analytics = await getReportAnalytics(agencyCode);
    res.status(200).json(analytics);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).json({ error: error.message });
  }
};
