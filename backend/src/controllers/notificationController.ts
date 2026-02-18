import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createNotification,
  getNotificationsByAgency,
  getAllNotifications,
} from '../services/notificationService';
import { logError } from '../utils/logger';
import { isValidServiceForAgency } from '../config/services';
import type { AgencyCode } from '../config/services';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userAgencyId || !req.userAgencyCode) {
      res.status(403).json({ error: 'Agency access required' });
      return;
    }

    const { serviceType } = req.body;
    if (!isValidServiceForAgency(serviceType, req.userAgencyCode as AgencyCode)) {
      res.status(403).json({ error: 'Invalid service type for your agency' });
      return;
    }

    const notification = await createNotification({
      ...req.body,
      agencyId: req.userAgencyId,
    });

    res.status(201).json(notification);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(400).json({ error: error.message });
  }
};

export const getAgencyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // super_admin without agency sees all notifications
    if (!req.userAgencyId && req.userRole !== 'super_admin') {
      res.status(403).json({ error: 'Agency access required' });
      return;
    }

    const notifications = req.userRole === 'super_admin' && !req.userAgencyId
      ? await getAllNotifications()
      : await getNotificationsByAgency(req.userAgencyId!);
    res.status(200).json(notifications);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).json({ error: error.message });
  }
};
