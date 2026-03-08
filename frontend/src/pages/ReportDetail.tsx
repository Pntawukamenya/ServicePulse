import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { useTranslation } from '../i18n/useTranslation';
import { getServiceDisplayName } from '../config/services';
import { ServiceIconBadge } from '../components/ServiceIcon';
import { PriorityPill } from '../components/PriorityPill';
import { useAuthStore } from '../store/authStore';

interface ReportData {
  id: string;
  service_type: string;
  location: string;
  sector?: string | null;
  cell?: string | null;
  description: string;
  status: 'received' | 'submitted' | 'under_review' | 'assigned' | 'in_progress' | 'escalated' | 'resolved' | 'rejected';
  assigned_to?: string | null;
  created_at: string;
  updated_at?: string;
  priority_level?: 'high' | 'medium' | 'low';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status_history?: Array<{ status: string; timestamp: string; updated_by?: string; updated_by_role?: string; comment?: string }>;
  allowed_next_statuses?: string[];
  resolved_at?: string | null;
  users?: {
    full_name: string | null;
    phone_number?: string | null;
    email?: string | null;
  };
}

function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const role = user?.role || '';
  const isAgencyAdmin = ['agency_admin', 'super_admin', 'admin'].includes(role);
  const isAgency = pathname.includes('/agency/');
  const backHref = isAgency ? '/agency/reports' : '/citizen/reports';
  const backLabel = isAgency ? t('agency.viewReports') : t('citizen.viewAllReports');

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    api
      .get(`/reports/${id}`)
      .then((res) => setReport(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!id || !report) return;
    setError('');
    setSuccess('');
    setUpdating(true);
    try {
      const res = await api.put(`/reports/${id}/status`, { status: newStatus });
      setReport({ ...res.data, users: res.data.users ?? report.users });
      setSuccess(t('agency.statusUpdated'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to update status';
      setError(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleClaim = async () => {
    if (!id || !report) return;
    setError('');
    setSuccess('');
    setUpdating(true);
    try {
      const res = await api.post(`/reports/${id}/claim`);
      setReport({ ...res.data, users: res.data.users ?? report.users });
      setSuccess(t('agency.statusUpdated'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to claim report';
      setError(message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDateCompact = (d: string | undefined) => {
    if (!d) return '—';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      received: t('agency.received'),
      submitted: t('agency.received'),
      under_review: 'Under Review',
      assigned: 'Assigned',
      in_progress: t('agency.inProgress'),
      escalated: t('agency.escalated'),
      resolved: t('agency.resolved'),
      rejected: 'Rejected',
    };
    return map[status] || status;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
      case 'in_progress': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200';
      case 'escalated': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200';
      case 'under_review':
      case 'assigned': return 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200';
      default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
    }
  };

  const isUnclaimed = report && (report.status === 'submitted' || report.status === 'received') && !report.assigned_to;
  const isClaimedByMe = report && report.assigned_to === user?.id;
  const isInProgressByMe = report?.status === 'in_progress' && isClaimedByMe;
  const isEscalated = report?.status === 'escalated';
  const canResolveEscalated = isEscalated && isAgencyAdmin;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
          <p className="mt-4 text-neutral-500 dark:text-neutral-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to={backHref} className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          {backLabel}
        </Link>
        <div className="card border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 text-center py-16">
          <p className="text-red-700 dark:text-red-300 font-medium">{error || 'Report not found'}</p>
          <Link to={backHref} className="btn btn-outline mt-6">Return to list</Link>
        </div>
      </div>
    );
  }

  const serviceLabel = getServiceDisplayName(report.service_type, t);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-emerald-700 dark:text-emerald-300 text-sm">
            {success}
          </div>
        )}
        {/* Header: ID, service, status, priority */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-3">
                  <ServiceIconBadge serviceCode={report.service_type} />
                </div>
                <div>
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">Report #{report.id.slice(0, 8).toUpperCase()}</span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-1 tracking-tight">
                    {serviceLabel}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadgeClass(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                    {report.status !== 'resolved' && (
                      <PriorityPill level={report.priority_level} className="text-[11px]" />
                    )}
                  </div>
                </div>
              </div>
              {isAgency && (
                <div className="flex flex-wrap gap-2">
                  {isUnclaimed && (
                    <button onClick={handleClaim} disabled={updating} className="btn btn-primary text-sm">
                      {t('agency.claim')}
                    </button>
                  )}
                  {isInProgressByMe && (
                    <>
                      <button onClick={() => updateStatus('resolved')} disabled={updating} className="btn btn-primary text-sm">
                        {t('agency.markResolved')}
                      </button>
                      <button onClick={() => updateStatus('escalated')} disabled={updating} className="btn btn-outline text-sm">
                        {t('agency.escalate')}
                      </button>
                    </>
                  )}
                  {canResolveEscalated && (
                    <button onClick={() => updateStatus('resolved')} disabled={updating} className="btn btn-primary text-sm">
                      {t('agency.markResolved')}
                    </button>
                  )}
                  {report?.status === 'in_progress' && !isClaimedByMe && (
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{t('agency.inProgressByColleague')}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description + Details sidebar — wider grid so cards use more horizontal space */}
        <div className="grid sm:grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 min-w-0">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Description of issue
                </h2>
              </div>
              <div className="p-6">
                <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed break-words text-[15px]">
                  {report.description}
                </p>
              </div>
            </div>
          </div>

          {/* Single Details card: Location, Timeline, Reporter */}
          <div className="lg:col-span-5 min-w-0">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/40">
                <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Details
                </h2>
              </div>

              {/* Location */}
              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Location</p>
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 shrink-0 text-neutral-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{report.location}</p>
                    {(report.sector || report.cell) && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {[report.sector, report.cell].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline: status history or created/updated */}
              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Timeline</p>
                <div className="space-y-3">
                  {report.status_history && report.status_history.length > 0
                    ? [...report.status_history]
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                        .map((entry, i) => (
                          <div key={i}>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{getStatusLabel(entry.status)}</p>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white mt-0.5 whitespace-nowrap">
                              {formatDateCompact(entry.timestamp)}
                            </p>
                            {entry.comment && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{entry.comment}</p>}
                          </div>
                        ))
                    : (
                      <>
                        <div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('common.submitted')}</p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white mt-0.5 whitespace-nowrap">
                            {formatDateCompact(report.created_at)}
                          </p>
                        </div>
                        {report.updated_at && report.updated_at !== report.created_at && (
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('common.updated')}</p>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white mt-0.5 whitespace-nowrap">
                              {formatDateCompact(report.updated_at)}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                </div>
              </div>

              {/* Reporter (agency only) */}
              {isAgency && report.users && (
                <div className="px-6 py-4">
                  <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                    {t('agency.reportedBy')}
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {report.users.full_name && (
                      <p className="font-medium text-neutral-900 dark:text-white">{report.users.full_name}</p>
                    )}
                    {report.users.phone_number && (
                      <p className="text-neutral-600 dark:text-neutral-300 whitespace-nowrap overflow-x-auto">{report.users.phone_number}</p>
                    )}
                    {report.users.email && (
                      <p className="text-neutral-600 dark:text-neutral-300 whitespace-nowrap overflow-x-auto">{report.users.email}</p>
                    )}
                    {!report.users.full_name && !report.users.phone_number && !report.users.email && (
                      <p className="text-neutral-500 dark:text-neutral-400">—</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportDetailPage;
