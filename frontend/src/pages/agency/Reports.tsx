import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useTranslation } from '../../i18n/useTranslation';
import { useAuthStore } from '../../store/authStore';
import { getServicesByAgency, getServiceLabelKey } from '../../config/services';
import type { AgencyCode } from '../../config/services';

interface Report {
  id: string;
  service_type: string;
  location: string;
  description: string;
  status: 'received' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at?: string;
  users?: {
    full_name: string;
    phone_number: string;
    email: string;
  };
}

export default function AgencyReports() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const agencyServices = getServicesByAgency((user?.agencyCode as AgencyCode) || 'REG');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    serviceType: '',
    status: '',
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.serviceType) params.append('serviceType', filters.serviceType);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/reports/agency?${params.toString()}`);
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reportId: string, newStatus: 'received' | 'in_progress' | 'resolved') => {
    try {
      await api.put(`/reports/${reportId}/status`, { status: newStatus });
      fetchReports();
    } catch (error) {
      console.error('Failed to update status:', error);
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

  const exportCsv = () => {
    const headers = ['ID', 'Service', 'Location', 'Status', 'Submitted'];
    const rows = reports.map((r) => [r.id, r.service_type, r.location, r.status, r.created_at]);
    const csv = [headers.join(','), ...rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">{t('agency.reportsInbox')}</h1>
        {reports.length > 0 && (
          <button onClick={exportCsv} className="btn btn-outline w-fit">
            {t('agency.exportCsv')}
          </button>
        )}
      </div>

      <div className="card mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="locationFilter" className="block text-sm font-medium mb-1">
              {t('agency.filterLocation')}
            </label>
            <input
              id="locationFilter"
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="input"
              placeholder={t('agency.searchLocation')}
            />
          </div>
          <div>
            <label htmlFor="serviceTypeFilter" className="block text-sm font-medium mb-1">
              {t('citizen.serviceType')}
            </label>
            <select
              id="serviceTypeFilter"
              value={filters.serviceType}
              onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
              className="input"
            >
              <option value="">{t('agency.allStatuses')}</option>
              {agencyServices.map((s) => (
                <option key={s.code} value={s.code}>{t(s.labelKey)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium mb-1">
              {t('agency.filterStatus')}
            </label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="">{t('agency.allStatuses')}</option>
              <option value="received">{t('agency.received')}</option>
              <option value="in_progress">{t('agency.inProgress')}</option>
              <option value="resolved">{t('agency.resolved')}</option>
            </select>
          </div>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">{t('agency.noReports')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">#{report.id.slice(0, 8).toUpperCase()}</span>
                    <h3 className="text-lg font-semibold">{getServiceLabelKey(report.service_type) ? t(getServiceLabelKey(report.service_type)!) : report.service_type}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t('citizen.location')}: {report.location}
                  </p>
                  {report.users && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t('agency.reportedBy')} {report.users.full_name} ({report.users.phone_number})
                    </p>
                  )}
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{report.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('common.submitted')}: {formatDate(report.created_at)}
                </span>
                <div className="flex space-x-2">
                  {report.status !== 'in_progress' && (
                    <button
                      onClick={() => updateStatus(report.id, 'in_progress')}
                      className="btn btn-outline text-sm"
                    >
                      {t('agency.markInProgress')}
                    </button>
                  )}
                  {report.status !== 'resolved' && (
                    <button
                      onClick={() => updateStatus(report.id, 'resolved')}
                      className="btn btn-primary text-sm"
                    >
                      {t('agency.markResolved')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
