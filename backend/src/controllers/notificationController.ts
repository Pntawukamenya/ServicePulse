import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createNotification,
  getNotificationsByAgency,
  getAllNotifications,
} from '../services/notificationService';
import { getAgencyByCode } from '../services/agencyService';
import { logError } from '../utils/logger';
import { isValidServiceForAgency } from '../config/services';
import type { AgencyCode } from '../config/services';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let agencyId = req.userAgencyId;
    let agencyCode = req.userAgencyCode;

    // Super_admin without agency can create alerts by passing agencyCode in body
    if ((!agencyId || !agencyCode) && req.userRole === 'super_admin') {
      const bodyCode = (req.body?.agencyCode as string)?.trim()?.toUpperCase();
      if (!bodyCode) {
        res.status(403).json({ error: 'Super admin must pass agencyCode in body to create an alert' });
        return;
      }
      const agency = await getAgencyByCode(bodyCode);
      if (!agency) {
        res.status(400).json({ error: 'Invalid agency code. Use a valid code (e.g. REG, WASAC, EMERGENCY).' });
        return;
      }
      agencyId = agency.id;
      agencyCode = agency.code;
    }

    if (!agencyId || !agencyCode) {
      res.status(403).json({ error: 'Agency access required' });
      return;
    }

    const { serviceType } = req.body;
    if (!isValidServiceForAgency(serviceType, agencyCode as AgencyCode)) {
      res.status(403).json({ error: 'Invalid service type for your agency' });
      return;
    }

    const notification = await createNotification({
      ...req.body,
      agencyId,
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
