import { Router } from 'express';
import { reportAnalytics } from '../controllers/analyticsController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get(
  '/reports',
  authenticate,
  requireRole('agency', 'agency_employee', 'agency_admin', 'super_admin', 'admin'),
  reportAnalytics
);

export default router;
