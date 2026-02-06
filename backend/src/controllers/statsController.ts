import { Request, Response } from 'express';
import { supabase } from '../config/database';

/**
 * Public stats for landing page - no auth required
 * Used to display platform impact metrics (FixMyStreet-style transparency)
 */
export async function getPublicStats(_req: Request, res: Response): Promise<void> {
  try {
    const [reportsRes, notificationsRes, resolvedRes] = await Promise.all([
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('notifications').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
    ]);

    const totalReports = reportsRes.count ?? 0;
    const totalAlerts = notificationsRes.count ?? 0;
    const resolvedReports = resolvedRes.count ?? 0;

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
