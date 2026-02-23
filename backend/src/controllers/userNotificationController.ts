import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getNotificationsForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../services/userNotificationService';
import { logError } from '../utils/logger';

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const limit = Math.min(parseInt(String(req.query.limit), 10) || 50, 100);
    const unreadOnly = req.query.unreadOnly === 'true';
    const list = await getNotificationsForUser(req.userId, { limit, unreadOnly });
    res.status(200).json(list);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).json({ error: error.message });
  }
};

export const getUnread = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const count = await getUnreadCount(req.userId);
    res.status(200).json({ count });
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).json({ error: error.message });
  }
};

export const markOneRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const updated = await markAsRead(req.params.id, req.userId);
    if (!updated) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).json({ error: error.message });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const count = await markAllAsRead(req.userId);
    res.status(200).json({ count });
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).json({ error: error.message });
  }
};
