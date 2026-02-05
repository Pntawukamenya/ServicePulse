import { Router } from 'express';
import { body } from 'express-validator';
import { create, getAgencyNotifications } from '../controllers/notificationController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

router.post(
  '/',
  authenticate,
  requireRole('agency', 'agency_admin', 'super_admin', 'admin'),
  validate([
    body('serviceType').trim().notEmpty(),
    body('message').trim().notEmpty().isLength({ min: 10, max: 160 }),
    body('targetAudience').isIn(['all', 'location_based']),
  ]),
  create
);

router.get('/agency', authenticate, requireRole('agency', 'agency_admin', 'super_admin', 'admin'), getAgencyNotifications);

export default router;
