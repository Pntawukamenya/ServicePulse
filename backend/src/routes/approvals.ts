import { Router } from 'express';
import { listPending, approve } from '../controllers/approvalController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('agency_admin', 'super_admin'), listPending);
router.post('/:userId/approve', authenticate, requireRole('agency_admin', 'super_admin'), approve);

export default router;
