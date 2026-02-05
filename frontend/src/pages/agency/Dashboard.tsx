import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n/useTranslation';

interface DashboardStats {
  totalAlerts: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
}

interface PendingUser {
  id: string;
  email: string | null;
  phone_number: string | null;
  full_name: string | null;
  created_at: string;
}

export default function AgencyDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [pendingApprovals, setPendingApprovals] = useState<PendingUser[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAlerts: 0,
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState('REG');

  useEffect(() => {
    fetchStats();
    if (user?.role === 'agency_admin') {
      api.get('/approvals').then((r) => setPendingApprovals(r.data)).catch(() => {});
    }
  }, [selectedAgency, user?.role]);

  const handleApprove = async (userId: string) => {
    try {
      await api.post(`/approvals/${userId}/approve`);
      setPendingApprovals((p) => p.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const [alertsRes, reportsRes] = await Promise.all([
        api.get('/notifications/agency'),
        api.get('/reports/agency'),
      ]);

      const alerts = alertsRes.data;
      const reports = reportsRes.data;

      setStats({
        totalAlerts: alerts.length,
        totalReports: reports.length,
        pendingReports: reports.filter((r: any) => r.status !== 'resolved').length,
        resolvedReports: reports.filter((r: any) => r.status === 'resolved').length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('agency.dashboard')}</h1>
        <select
          value={selectedAgency}
          onChange={(e) => setSelectedAgency(e.target.value)}
          className="input w-auto"
        >
          <option value="REG">{t('agency.reg')}</option>
          <option value="WASAC">{t('agency.wasac')}</option>
          <option value="EMERGENCY">{t('agency.emergency')}</option>
        </select>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {t('agency.welcome')}, {user?.fullName}
      </p>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('agency.alertsSent')}</h3>
          <p className="text-3xl font-bold">{stats.totalAlerts}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('agency.totalReports')}</h3>
          <p className="text-3xl font-bold">{stats.totalReports}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('citizen.pending')}</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingReports}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('agency.resolved')}</h3>
          <p className="text-3xl font-bold text-green-600">{stats.resolvedReports}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{t('agency.quickActions')}</h2>
          <div className="space-y-3">
            <Link to="/agency/alerts" className="block w-full btn btn-primary text-center">
              {t('agency.createAlert')}
            </Link>
            <Link to="/agency/reports" className="block w-full btn btn-outline text-center">
              {t('agency.viewReports')}
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{t('agency.recentActivity')}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('agency.recentActivityDesc')}
          </p>
        </div>
      </div>

      {user?.role === 'agency_admin' && pendingApprovals.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4">{t('agency.pendingApprovals')}</h2>
          <div className="space-y-3">
            {pendingApprovals.map((u) => (
              <div key={u.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm">{u.email || u.phone_number || u.full_name || u.id}</span>
                <button onClick={() => handleApprove(u.id)} className="btn btn-primary text-sm">
                  {t('agency.approve')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
