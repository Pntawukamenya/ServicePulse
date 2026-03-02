import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createReport,
  getReportsByUser,
  getReportsByAgency,
  getAllReports,
  getReportById,
  updateReportStatus,
  getReportClusters,
  getAllReportClusters,
  getReportsNearby,
  deleteReport,
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

export const getOne = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const report = await getReportById(req.params.id, {
      userId: req.userId,
      userRole: req.userRole || undefined,
      userAgencyId: req.userAgencyId,
    });
    res.status(200).json(report);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(error.message === 'Report not found' ? 404 : 403).json({ error: error.message });
  }
};

export const getAgencyReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // super_admin without agency sees all; others need agency
    if (!req.userAgencyId && req.userRole !== 'super_admin') {
      res.status(403).json({ error: 'Agency access required' });
      return;
    }

    const filters = {
      serviceType: req.query.serviceType as string,
      location: req.query.location as string,
      status: req.query.status as string,
    };

    const reports = req.userRole === 'super_admin' && !req.userAgencyId
      ? await getAllReports(filters)
      : await getReportsByAgency(req.userAgencyId!, filters, { role: req.userRole || '' });
    res.status(200).json(reports);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).json({ error: error.message });
  }
};

export const updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!req.userAgencyId && req.userRole !== 'super_admin') {
      res.status(403).json({ error: 'Agency access required' });
      return;
    }

    const report = await updateReportStatus({
      reportId: req.params.id,
      status: req.body.status,
      agencyId: req.userAgencyId!,
      updatedByUserId: req.userId,
      updatedByRole: req.userRole || 'agency',
      comment: req.body.comment,
    });

    res.status(200).json(report);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(400).json({ error: error.message });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await deleteReport(
      req.params.id,
      req.userId,
      req.userRole || '',
      req.userAgencyId
    );
    res.status(204).send();
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(error.message?.includes('not found') ? 404 : 403).json({ error: error.message });
  }
};

export const getClusters = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userAgencyId && req.userRole !== 'super_admin') {
      res.status(403).json({ error: 'Agency access required' });
      return;
    }

    const clusters = req.userRole === 'super_admin' && !req.userAgencyId
      ? await getAllReportClusters()
      : await getReportClusters(req.userAgencyId!);
    res.status(200).json(clusters);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).json({ error: error.message });
  }
};

export const getNearby = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const lat = parseFloat(String(req.query.lat));
    const lng = parseFloat(String(req.query.lng));
    const maxKm = Math.min(parseFloat(String(req.query.maxKm)) || 10, 100);
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({ error: 'Valid lat and lng required' });
      return;
    }
    const agencyCode = req.userAgencyId ? req.userAgencyCode ?? undefined : undefined;
    const reports = await getReportsNearby(lng, lat, maxKm, { agencyCode, limit: 30 });
    res.status(200).json(reports);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).json({ error: error.message });
  }
};
