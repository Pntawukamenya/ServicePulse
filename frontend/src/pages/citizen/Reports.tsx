import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useTranslation } from '../../i18n/useTranslation';

interface Report {
  id: string;
  service_type: string;
  location: string;
  description: string;
  status: 'received' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at?: string;
}

export default function CitizenReports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports/my-reports');
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      received: t('agency.received'),
      in_progress: t('agency.inProgress'),
      resolved: t('agency.resolved'),
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <h1 className="text-3xl font-bold mb-8">{t('citizen.myReports')}</h1>

      {reports.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('citizen.noReports')}</p>
          <Link to="/citizen/report" className="btn btn-primary">
            {t('citizen.submitFirst')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{report.service_type}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{report.location}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  {getStatusLabel(report.status)}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{report.description}</p>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{t('common.submitted')}: {formatDate(report.created_at)}</span>
                {report.updated_at && report.updated_at !== report.created_at && (
                  <span>{t('common.updated')}: {formatDate(report.updated_at)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
