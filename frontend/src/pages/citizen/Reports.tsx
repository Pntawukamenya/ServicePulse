import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../lib/api';
import { useTranslation } from '../../i18n/useTranslation';
import { getServiceLabelKey } from '../../config/services';
import ReportCard from '../../components/ReportCard';

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
  const { pathname } = useLocation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'status'>('newest');

  // Refetch when on reports list so list stays in sync with DB (e.g. when navigating back from report detail)
  useEffect(() => {
    if (pathname !== '/citizen/reports') return;
    fetchReports();
  }, [pathname]);

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

  const filteredAndSorted = useMemo(() => {
    let list = [...reports];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.description.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.service_type.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      const order = { resolved: 0, in_progress: 1, received: 2 };
      return (order[a.status as keyof typeof order] ?? 3) - (order[b.status as keyof typeof order] ?? 3);
    });
    return list;
  }, [reports, search, sortBy]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">{t('citizen.myReports')}</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Track and manage your service reports</p>
      </div>
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="search"
          placeholder="Search reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-xs"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="input select w-auto">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="status">By status</option>
        </select>
      </div>

      {reports.length === 0 ? (
        <div className="card text-center py-16 px-8 max-w-md mx-auto border border-neutral-200 dark:border-neutral-700">
          <div className="w-12 h-12 mx-auto mb-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{t('citizen.noReports')}</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">Submit your first report to get started</p>
          <Link to="/citizen/report" className="btn btn-primary">
            {t('citizen.submitFirst')}
          </Link>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No reports match your search. Try different keywords.</p>
          <button onClick={() => setSearch('')} className="btn btn-outline">Clear search</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
          {filteredAndSorted.map((report) => (
            <ReportCard
              key={report.id}
              compact
              to={`/citizen/reports/${report.id}`}
              id={report.id}
              serviceType={report.service_type}
              displayLabel={getServiceLabelKey(report.service_type) ? t(getServiceLabelKey(report.service_type)!) : undefined}
              location={report.location}
              description={report.description}
              status={report.status}
              created_at={report.created_at}
              updated_at={report.updated_at}
              statusLabel={getStatusLabel}
              statusBadge={getStatusBadge}
              formatDate={formatDate}
              submittedLabel={t('common.submitted')}
              updatedLabel={t('common.updated')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
