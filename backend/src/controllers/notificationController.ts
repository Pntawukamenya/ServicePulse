import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createNotification,
  getNotificationsByAgency,
} from '../services/notificationService';
import { logError } from '../utils/logger';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userAgencyId) {
      res.status(403).json({ error: 'Agency access required' });
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
    if (!req.userAgencyId) {
      res.status(403).json({ error: 'Agency access required' });
      return;
    }

    const notifications = await getNotificationsByAgency(req.userAgencyId);
    res.status(200).json(notifications);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).json({ error: error.message });
  }
};
