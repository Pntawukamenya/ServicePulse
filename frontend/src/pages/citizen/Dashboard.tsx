import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n/useTranslation';

interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
}

export default function CitizenDashboard() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/reports/my-reports');
      const reports = response.data;
      
      setStats({
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
      <div className="container-main py-12">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container-main py-12">
      <h1 className="text-3xl font-bold mb-8">{t('citizen.dashboard')}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {t('citizen.welcome')}, {user?.fullName}
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('citizen.totalReports')}</h3>
          <p className="text-3xl font-bold">{stats.totalReports}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('citizen.pending')}</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingReports}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('citizen.resolved')}</h3>
          <p className="text-3xl font-bold text-green-600">{stats.resolvedReports}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{t('citizen.quickActions')}</h2>
          <div className="space-y-3">
            <Link to="/citizen/report" className="block w-full btn btn-primary text-center">
              {t('citizen.submitNewReport')}
            </Link>
            <Link to="/citizen/reports" className="block w-full btn btn-outline text-center">
              {t('citizen.viewAllReports')}
            </Link>
            <Link to="/citizen/profile" className="block w-full btn btn-outline text-center">
              {t('citizen.manageProfile')}
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{t('citizen.serviceInfo')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('citizen.serviceInfoDesc')}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
              <span>{t('home.reg')}</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
              <span>{t('home.wasac')}</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
              <span>{t('home.emergency')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
