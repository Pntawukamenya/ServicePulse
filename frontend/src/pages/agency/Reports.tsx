import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { useTranslation } from '../../i18n/useTranslation';
import { useAuthStore } from '../../store/authStore';
import { getServicesByAgency, getServiceLabelKey } from '../../config/services';
import type { AgencyCode } from '../../config/services';
import ReportCard from '../../components/ReportCard';

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
  const [searchParams] = useSearchParams();
  const agencyServices = getServicesByAgency((user?.agencyCode as AgencyCode) || 'REG');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => ({
    location: searchParams.get('location') || '',
    serviceType: searchParams.get('serviceType') || '',
    status: searchParams.get('status') || '',
  }));

  useEffect(() => {
    const location = searchParams.get('location') || '';
    const status = searchParams.get('status') || '';
    const serviceType = searchParams.get('serviceType') || '';
    setFilters({ location, status, serviceType });
  }, [searchParams]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved': return 'badge-success';
      case 'in_progress': return 'badge-info';
      default: return 'badge-warning';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
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
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
          <span className="ml-3 text-neutral-500">{t('common.loading')}</span>
        </div>
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">{t('agency.reportsInbox')}</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">Review and manage citizen service reports</p>
        </div>
        {reports.length > 0 && (
          <button onClick={exportCsv} className="btn btn-outline w-fit shrink-0">
            {t('agency.exportCsv')}
          </button>
        )}
      </div>

      <div className="card card-flat mb-6">
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
              className="input select"
            >
              <option value="">{t('agency.allServices')}</option>
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
              className="input select"
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
        <div className="card text-center py-16 px-8 max-w-md mx-auto border border-neutral-200 dark:border-neutral-700">
          <div className="w-12 h-12 mx-auto mb-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{t('agency.noReports')}</h3>
          <p className="text-neutral-600 dark:text-neutral-400">Reports from citizens will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              compact
              to={`/agency/reports/${report.id}`}
              id={report.id}
              serviceType={report.service_type}
              displayLabel={getServiceLabelKey(report.service_type) ? t(getServiceLabelKey(report.service_type)!) : undefined}
              location={report.location}
              description={report.description}
              status={report.status}
              created_at={report.created_at}
              updated_at={report.updated_at}
              reporter={report.users}
              statusLabel={getStatusLabel}
              statusBadge={getStatusBadge}
              formatDate={formatDate}
              showActions
              reportIdPrefix="R"
              submittedLabel={t('common.submitted')}
              updatedLabel={t('common.updated')}
              reportedByLabel={t('agency.reportedBy')}
              markInProgressLabel={t('agency.markInProgress')}
              markResolvedLabel={t('agency.markResolved')}
              priority_level={(report as any).priority_level}
              onMarkInProgress={() => updateStatus(report.id, 'in_progress')}
              onMarkResolved={() => updateStatus(report.id, 'resolved')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
