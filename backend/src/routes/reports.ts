import { Router } from 'express';
import { body } from 'express-validator';
import {
  create,
  getMyReports,
  getAgencyReports,
  getOne,
  updateStatus,
  getClusters,
  getNearby,
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
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('sector').optional().trim(),
    body('cell').optional().trim(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('address').optional().trim().isLength({ max: 500 }),
    body('attachments').optional().isArray(),
  ]),
  create
);

router.get('/my-reports', authenticate, requireRole('citizen'), getMyReports);

router.get('/nearby', authenticate, requireRole('citizen', 'agency', 'agency_admin', 'super_admin', 'admin'), getNearby);

// Agency routes (must be before /:id so "agency" is not captured as id)
router.get('/agency', authenticate, requireRole('agency', 'agency_admin', 'super_admin', 'admin'), getAgencyReports);
router.get('/agency/clusters', authenticate, requireRole('agency', 'agency_admin', 'super_admin', 'admin'), getClusters);

// Parameterized routes (after literal paths)
router.get('/:id', authenticate, requireRole('citizen', 'agency', 'agency_admin', 'super_admin', 'admin'), getOne);
router.put(
  '/:id/status',
  authenticate,
  requireRole('agency', 'agency_admin', 'super_admin', 'admin'),
  validate([
    body('status').trim().notEmpty().isIn(['submitted', 'received', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected']),
    body('comment').optional().trim().isLength({ max: 500 }),
  ]),
  updateStatus
);
router.delete('/:id', authenticate, requireRole('citizen', 'agency_admin', 'super_admin', 'agency', 'admin'), remove);

export default router;
