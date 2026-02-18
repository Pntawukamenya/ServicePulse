import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n/useTranslation';
import { getServiceLabelKey } from '../../config/services';
import { ServiceIconBadge } from '../../components/ServiceIcon';

interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  resolutionRate: number;
}

interface RecentReport {
  id: string;
  service_type: string;
  location: string;
  status: string;
  created_at: string;
}

const StatCard = ({ icon, label, value, color = 'text-neutral-900 dark:text-white', to }: { icon: React.ReactNode; label: string; value: number | string; color?: string; to?: string }) => {
  const content = (
    <>
      <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </>
  );
  const className = 'card card-flat flex items-start gap-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50';
  return to ? <Link to={to} className={className}>{content}</Link> : <div className={className}>{content}</div>;
};

export default function CitizenDashboard() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({ totalReports: 0, pendingReports: 0, resolvedReports: 0, resolutionRate: 0 });
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchStats();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/reports/my-reports');
      const reports = response.data;
      const pending = reports.filter((r: any) => r.status !== 'resolved').length;
      const resolved = reports.filter((r: any) => r.status === 'resolved').length;
      const resolutionRate = reports.length > 0 ? Math.round((resolved / reports.length) * 100) : 0;

      setStats({
        totalReports: reports.length,
        pendingReports: pending,
        resolvedReports: resolved,
        resolutionRate,
      });
      setRecentReports(reports.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'resolved') return 'badge-success';
    if (status === 'in_progress') return 'badge-info';
    return 'badge-warning';
  };

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
      <h1 className="text-h1 mb-2">{t('citizen.dashboard')}</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8">
        {t('citizen.welcome')}, {user?.fullName || user?.email || user?.phoneNumber}
      </p>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard
          to="/citizen/reports"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          label={t('citizen.totalReports')}
          value={stats.totalReports}
        />
        <StatCard
          to="/citizen/reports"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label={t('citizen.pending')}
          value={stats.pendingReports}
          color="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          to="/citizen/reports"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label={t('citizen.resolved')}
          value={stats.resolvedReports}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          to="/citizen/reports"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          label={t('citizen.resolutionRate')}
          value={`${stats.resolutionRate}%`}
          color="text-primary-600 dark:text-primary-400"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card card-flat md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">{t('citizen.quickActions')}</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link to="/citizen/report" className="flex flex-col items-center justify-center p-4 rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50/30 dark:bg-primary-900/10 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span className="text-sm font-medium text-center">{t('citizen.submitNewReport')}</span>
            </Link>
            <Link to="/citizen/reports" className="flex flex-col items-center justify-center p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <svg className="w-8 h-8 text-neutral-600 dark:text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="text-sm font-medium text-center">{t('citizen.viewAllReports')}</span>
            </Link>
            <Link to="/citizen/profile" className="flex flex-col items-center justify-center p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <svg className="w-8 h-8 text-neutral-600 dark:text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="text-sm font-medium text-center">{t('citizen.manageProfile')}</span>
            </Link>
          </div>
        </div>

        <Link to="/citizen/report" className="card card-flat block transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
          <h2 className="text-xl font-semibold mb-4">{t('citizen.serviceInfo')}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4 text-sm">{t('citizen.serviceInfoDesc')}</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              <span>{t('home.reg')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>{t('home.wasac')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>{t('home.emergency')}</span>
            </div>
          </div>
        </Link>
      </div>

      {recentReports.length > 0 && (
        <div className="card mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('citizen.recentReports')}</h2>
            <Link to="/citizen/reports" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">{t('citizen.viewAllReports')}</Link>
          </div>
          <div className="space-y-3">
            {recentReports.map((r) => (
              <Link key={r.id} to="/citizen/reports" className="flex items-center gap-3 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <ServiceIconBadge serviceCode={r.service_type} size="sm" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm block truncate">{getServiceLabelKey(r.service_type) ? t(getServiceLabelKey(r.service_type)!) : r.service_type}</span>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">{r.location}</p>
                </div>
                <span className={`shrink-0 ${getStatusBadge(r.status)}`}>
                  {r.status === 'resolved' ? t('citizen.resolved') : r.status === 'in_progress' ? t('agency.inProgress') : t('citizen.pending')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
