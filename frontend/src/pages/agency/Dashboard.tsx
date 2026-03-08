import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n/useTranslation';
import { getServiceDisplayName } from '../../config/services';
import { ServiceIconBadge } from '../../components/ServiceIcon';
import { PriorityPill } from '../../components/PriorityPill';

interface DashboardStats {
  totalAlerts: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
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
  priority_score?: number;
  priority_level?: 'high' | 'medium' | 'low';
}

interface RecentAlert {
  id: string;
  service_type: string;
  message: string;
  created_at: string;
  priority_score?: number;
  priority_level?: 'high' | 'medium' | 'low';
}

export default function AgencyDashboard() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({ totalAlerts: 0, totalReports: 0, pendingReports: 0, resolvedReports: 0 });
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const role = user?.role || '';
  const isAgencyAdmin = ['agency_admin', 'super_admin', 'admin'].includes(role);

  // Refetch when user lands on dashboard so stats/recent activity stay in sync with DB (e.g. after updating a report or creating an alert)
  useEffect(() => {
    if (pathname !== '/agency/dashboard') return;
    fetchStats();
  }, [pathname]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchStats();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const fetchStats = async () => {
    try {
      const [alertsRes, reportsRes, clustersRes] = await Promise.all([
        api.get('/notifications/agency'),
        api.get('/reports/agency'),
        api.get('/reports/agency/clusters').catch(() => ({ data: [] })),
      ]);

      const alerts = alertsRes.data;
      const allReports = reportsRes.data;
      const visibleReports = isAgencyAdmin
        ? allReports
        : allReports.filter((r: any) => r.status !== 'resolved' && r.status !== 'rejected');

      setStats({
        totalAlerts: alerts.length,
        totalReports: visibleReports.length,
        pendingReports: visibleReports.filter((r: any) => r.status !== 'resolved').length,
        resolvedReports: isAgencyAdmin ? visibleReports.filter((r: any) => r.status === 'resolved').length : 0,
      });
      setClusters(clustersRes.data?.slice(0, 5) || []);
      setRecentReports(visibleReports.slice(0, 4));
      setRecentAlerts(alerts.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Mix reports and alerts; sort by priority (high first) then by date
  const recentActivity = useMemo(() => {
    const items: Array<
      | { type: 'report'; id: string; createdAt: string; priorityScore: number; data: RecentReport }
      | { type: 'alert'; id: string; createdAt: string; priorityScore: number; data: RecentAlert }
    > = [
      ...recentReports.map((r) => ({ type: 'report' as const, id: r.id, createdAt: r.created_at, priorityScore: (r as any).priority_score ?? 0, data: r })),
      ...recentAlerts.map((a) => ({ type: 'alert' as const, id: a.id, createdAt: (a as any).created_at ?? (a as any).createdAt ?? '', priorityScore: (a as any).priority_score ?? 0, data: a })),
    ];
    return items
      .sort((a, b) => {
        if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 6);
  }, [recentReports, recentAlerts]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
          <span className="ml-3 text-neutral-500">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <h1 className="text-h1 mb-2">{t('agency.dashboard')}</h1>

      <p className="text-neutral-600 dark:text-neutral-400 mb-8">
        {t('agency.welcome')}, {user?.fullName?.trim().split(/\s+/)[0] ?? user?.fullName}
      </p>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Link to="/agency/alerts" className="card card-flat block transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">{t('agency.alertsSent')}</h3>
          <p className="text-3xl font-bold">{stats.totalAlerts}</p>
        </Link>
        <Link to="/agency/reports" className="card card-flat block transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">{t('agency.totalReports')}</h3>
          <p className="text-3xl font-bold">{stats.totalReports}</p>
        </Link>
        <Link to="/agency/reports" className="card card-flat block transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">{t('citizen.pending')}</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingReports}</p>
        </Link>
        {isAgencyAdmin && (
          <Link to="/agency/reports?status=resolved" className="card card-flat block transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">{t('agency.resolved')}</h3>
            <p className="text-3xl font-bold text-green-600">{stats.resolvedReports}</p>
          </Link>
        )}
      </div>

      <div className={`grid gap-6 ${clusters.length > 0 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{t('agency.recentActivity')}</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-neutral-500">No recent activity</p>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map((item) =>
                item.type === 'report' ? (
                  <Link key={`r-${item.id}`} to={`/agency/reports/${item.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors block">
                    <ServiceIconBadge serviceCode={item.data.service_type} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="block text-sm font-medium truncate">{getServiceDisplayName(item.data.service_type, t)}</span>
                        {item.data.status !== 'resolved' && <PriorityPill level={item.data.priority_level} />}
                      </div>
                      <span className="text-xs text-neutral-500">{formatDate(item.data.created_at)} · Report</span>
                    </div>
                    {isAgencyAdmin && (
                      <span className={`shrink-0 text-xs ${item.data.status === 'resolved' ? 'badge-success' : item.data.status === 'in_progress' ? 'badge-info' : 'badge-warning'}`}>
                        {item.data.status === 'resolved' ? t('agency.resolved') : item.data.status === 'in_progress' ? t('agency.inProgress') : t('agency.received')}
                      </span>
                    )}
                  </Link>
                ) : (
                  <Link key={`a-${item.id}`} to="/agency/alerts" className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors block">
                    <ServiceIconBadge serviceCode={item.data.service_type} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm font-medium truncate">{getServiceDisplayName(item.data.service_type, t)}</p>
                        <PriorityPill level={item.data.priority_level} />
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{item.data.message}</p>
                      <span className="text-xs text-neutral-400">{formatDate(item.createdAt)} · Alert</span>
                    </div>
                  </Link>
                )
              )}
            </ul>
          )}
        </div>

        {clusters.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">{t('agency.serviceHotspots')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Top locations by report count</p>
            <div className="space-y-2">
              {clusters.map((c) => (
                <Link key={c.location} to={`/agency/reports?location=${encodeURIComponent(c.location || '')}`} className="flex justify-between items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors block">
                  <span className="text-sm font-medium truncate flex-1">{c.location || 'Unknown'}</span>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400 ml-2">{c.count}</span>
                </Link>
              ))}
            </div>
            <Link to="/agency/reports" className="mt-4 block text-sm text-primary-600 dark:text-primary-400 hover:underline">View all reports →</Link>
          </div>
        )}

        <div className="card self-start">
          <h2 className="text-xl font-semibold mb-4">{t('agency.quickActions')}</h2>
          <div className="flex flex-col gap-3">
            <Link to="/agency/alerts" className="w-full btn btn-primary justify-center">
              {t('agency.createAlert')}
            </Link>
            <Link to="/agency/reports" className="w-full btn btn-outline justify-center">
              {t('agency.viewReports')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
