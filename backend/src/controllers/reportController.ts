import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createReport,
  getReportsByUser,
  getReportsByAgency,
  updateReportStatus,
  getReportClusters,
} from '../services/reportService';
import { logError } from '../utils/logger';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const report = await createReport({
      ...req.body,
      userId: req.userId,
    });

    res.status(201).json(report);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(400).json({ error: error.message });
  }
};

export const getMyReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const reports = await getReportsByUser(req.userId);
    res.status(200).json(reports);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).json({ error: error.message });
  }
};

export const getAgencyReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userAgencyId) {
      res.status(403).json({ error: 'Agency access required' });
      return;
    }

    const filters = {
      serviceType: req.query.serviceType as string,
      location: req.query.location as string,
      status: req.query.status as string,
    };

    const reports = await getReportsByAgency(req.userAgencyId, filters);
    res.status(200).json(reports);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).json({ error: error.message });
  }
};

export const updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userAgencyId) {
      res.status(403).json({ error: 'Agency access required' });
      return;
    }

    const report = await updateReportStatus({
      reportId: req.params.id,
      status: req.body.status,
      agencyId: req.userAgencyId,
    });

    res.status(200).json(report);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(400).json({ error: error.message });
  }
};

export const getClusters = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userAgencyId) {
      res.status(403).json({ error: 'Agency access required' });
      return;
    }

    const clusters = await getReportClusters(req.userAgencyId);
    res.status(200).json(clusters);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).json({ error: error.message });
  }
};
