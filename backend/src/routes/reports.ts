import { Router } from 'express';
import { body } from 'express-validator';
import {
  create,
  getMyReports,
  getAgencyReports,
  updateStatus,
  getClusters,
  remove,
} from '../controllers/reportController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// Citizen routes
router.post(
  '/',
  authenticate,
  requireRole('citizen'),
  validate([
    body('serviceType').trim().notEmpty(),
    body('location').trim().notEmpty(),
    body('description').trim().notEmpty(),
  ]),
  create
);

router.get('/my-reports', authenticate, requireRole('citizen'), getMyReports);
router.delete('/:id', authenticate, requireRole('citizen', 'agency_admin', 'super_admin', 'agency', 'admin'), remove);

// Agency routes
router.get('/agency', authenticate, requireRole('agency', 'agency_admin', 'super_admin', 'admin'), getAgencyReports);
router.put('/:id/status', authenticate, requireRole('agency', 'agency_admin', 'super_admin', 'admin'), updateStatus);
router.get('/agency/clusters', authenticate, requireRole('agency', 'agency_admin', 'super_admin', 'admin'), getClusters);

export default router;
