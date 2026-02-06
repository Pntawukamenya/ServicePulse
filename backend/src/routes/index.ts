import { Router } from 'express';
import authRoutes from './auth';
import reportRoutes from './reports';
import notificationRoutes from './notifications';
import approvalRoutes from './approvals';
import statsRoutes from './stats';

const router = Router();

router.use('/auth', authRoutes);
router.use('/stats', statsRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/approvals', approvalRoutes);

export default router;
