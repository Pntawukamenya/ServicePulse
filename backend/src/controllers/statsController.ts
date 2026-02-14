import { Request, Response } from 'express';
import Report from '../models/Report';
import Notification from '../models/Notification';

/**
 * Public stats for landing page - no auth required
 * Used to display platform impact metrics (FixMyStreet-style transparency)
 */
export async function getPublicStats(_req: Request, res: Response): Promise<void> {
  try {
    const [totalReports, totalAlerts, resolvedReports] = await Promise.all([
      Report.countDocuments(),
      Notification.countDocuments(),
      Report.countDocuments({ status: 'resolved' }),
    ]);

    res.json({
      totalReports,
      resolvedReports,
      totalAlerts,
      citizensServed: totalReports + totalAlerts,
    });
  } catch (error: any) {
    res.status(500).json({
      totalReports: 0,
      resolvedReports: 0,
      totalAlerts: 0,
      citizensServed: 0,
      error: error?.message,
    });
  }
}
