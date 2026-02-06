import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n/useTranslation';
import { getServiceLabelKey } from '../../config/services';

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

interface Cluster {
  location: string;
  count: number;
}

interface RecentReport {
  id: string;
  service_type: string;
  location: string;
  status: string;
  created_at: string;
}

interface RecentAlert {
  id: string;
  service_type: string;
  message: string;
  created_at: string;
}

export default function AgencyDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [pendingApprovals, setPendingApprovals] = useState<PendingUser[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalAlerts: 0, totalReports: 0, pendingReports: 0, resolvedReports: 0 });
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    if (user?.role === 'agency_admin') {
      api.get('/approvals').then((r) => setPendingApprovals(r.data)).catch(() => {});
    }
  }, [user?.role]);

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
      const [alertsRes, reportsRes, clustersRes] = await Promise.all([
        api.get('/notifications/agency'),
        api.get('/reports/agency'),
        api.get('/reports/agency/clusters').catch(() => ({ data: [] })),
      ]);

      const alerts = alertsRes.data;
      const reports = reportsRes.data;

      setStats({
        totalAlerts: alerts.length,
        totalReports: reports.length,
        pendingReports: reports.filter((r: any) => r.status !== 'resolved').length,
        resolvedReports: reports.filter((r: any) => r.status === 'resolved').length,
      });
      setClusters(clustersRes.data?.slice(0, 5) || []);
      setRecentReports(reports.slice(0, 4));
      setRecentAlerts(alerts.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center py-12">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8">{t('agency.dashboard')}</h1>

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

      <div className={`grid gap-6 ${clusters.length > 0 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
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
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">{t('agency.latestReports')}</h3>
              {recentReports.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-500">No reports yet</p>
              ) : (
                <ul className="space-y-2">
                  {recentReports.map((r) => (
                    <li key={r.id} className="flex justify-between items-start text-sm">
                      <span className="truncate flex-1">{getServiceLabelKey(r.service_type) ? t(getServiceLabelKey(r.service_type)!) : r.service_type}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${r.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : r.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>{r.status === 'resolved' ? t('agency.resolved') : r.status === 'in_progress' ? t('agency.inProgress') : t('agency.received')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">{t('agency.recentAlerts')}</h3>
              {recentAlerts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-500">No alerts sent yet</p>
              ) : (
                <ul className="space-y-2">
                  {recentAlerts.map((a) => (
                    <li key={a.id} className="text-sm">
                      <p className="font-medium truncate">{getServiceLabelKey(a.service_type) ? t(getServiceLabelKey(a.service_type)!) : a.service_type}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(a.created_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {clusters.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">{t('agency.serviceHotspots')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Top locations by report count</p>
            <div className="space-y-2">
              {clusters.map((c) => (
                <div key={c.location} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-sm font-medium truncate flex-1">{c.location || 'Unknown'}</span>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400 ml-2">{c.count}</span>
                </div>
              ))}
            </div>
            <Link to="/agency/reports" className="mt-4 block text-sm text-primary-600 dark:text-primary-400 hover:underline">View all reports →</Link>
          </div>
        )}
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
