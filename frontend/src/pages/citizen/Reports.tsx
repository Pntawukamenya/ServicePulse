import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useTranslation } from '../../i18n/useTranslation';
import { getServiceLabelKey } from '../../config/services';

interface Report {
  id: string;
  service_type: string;
  location: string;
  description: string;
  status: 'received' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at?: string;
}

function getReportId(id: string) {
  return `#SP-${id.slice(0, 8).toUpperCase()}`;
}

export default function CitizenReports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'status'>('newest');

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
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
          <span className="ml-3 text-neutral-500">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">{t('citizen.myReports')}</h1>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input max-w-xs"
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="input w-auto">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="status">By status</option>
          </select>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('citizen.noReports')}</p>
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
        <div className="space-y-4">
          {filteredAndSorted.map((report) => (
            <div key={report.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{getReportId(report.id)}</span>
                    <h3 className="text-lg font-semibold">{getServiceLabelKey(report.service_type) ? t(getServiceLabelKey(report.service_type)!) : report.service_type}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{report.location}</p>
                </div>
                <span className={`${getStatusBadge(report.status)}`}>
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
