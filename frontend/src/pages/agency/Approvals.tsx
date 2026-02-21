import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../lib/api';
import { useTranslation } from '../../i18n/useTranslation';

interface PendingUser {
  id: string;
  email: string | null;
  phone_number: string | null;
  full_name: string | null;
  created_at: string;
}

export default function Approvals() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [list, setList] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== '/agency/approvals') return;
    fetchList();
  }, [pathname]);

  const fetchList = async () => {
    try {
      const res = await api.get('/approvals');
      setList(res.data);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setApprovingId(userId);
    try {
      await api.post(`/approvals/${userId}/approve`);
      setList((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      // keep in list on error
    } finally {
      setApprovingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayLabel = (u: PendingUser) =>
    u.full_name?.trim() || u.email || u.phone_number || u.id;

  const displayContact = (u: PendingUser) => {
    const parts = [u.email, u.phone_number].filter(Boolean);
    return parts.length ? parts.join(' · ') : null;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-9 w-64 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-4 w-96 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="mt-10 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
          {t('agency.approvalsPageTitle')}
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {t('agency.approvalsPageDesc')}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="card text-center py-16 px-8 max-w-md mx-auto border border-neutral-200 dark:border-neutral-700">
          <div className="w-12 h-12 mx-auto mb-6 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-neutral-500 dark:text-neutral-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            {t('agency.noPendingApprovals')}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            {t('agency.noPendingApprovalsDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((user) => (
            <div
              key={user.id}
              className="card card-flat flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-neutral-900 dark:text-white truncate">
                  {displayLabel(user)}
                </p>
                {displayContact(user) && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5 truncate">
                    {displayContact(user)}
                  </p>
                )}
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                  {t('agency.submitted')} {formatDate(user.created_at)}
                </p>
              </div>
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => handleApprove(user.id)}
                  disabled={approvingId === user.id}
                  className="btn btn-primary text-sm"
                >
                  {approvingId === user.id ? t('agency.approving') : t('agency.approve')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
