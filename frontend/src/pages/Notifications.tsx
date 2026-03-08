import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useTranslation } from '../i18n/useTranslation';
import { useAuthStore } from '../store/authStore';
import { getServiceDisplayName } from '../config/services';
import Pagination, { DEFAULT_PAGE_SIZE } from '../components/Pagination';

interface UserNotification {
  id: string;
  message: string;
  related_report_id: string | null;
  read: boolean;
  type: string;
  created_at: string;
  service_type?: string | null;
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const isCitizen = useAuthStore((s) => s.isCitizen?.() ?? true);
  const [list, setList] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    api.get('/notifications/user').then((res) => setList(res.data)).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const markOne = async (id: string) => {
    try {
      await api.patch(`/notifications/user/${id}/read`);
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {}
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      const res = await api.patch('/notifications/user/read-all');
      const count = res.data?.count ?? 0;
      if (count > 0) {
        setList((prev) => prev.map((n) => ({ ...n, read: true })));
        window.dispatchEvent(new Event('notifications-updated'));
      }
    } catch {}
    finally { setMarkingAll(false); }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getSummary = (n: UserNotification) => {
    const serviceLabel = n.service_type ? getServiceDisplayName(n.service_type, t) : null;
    const issueType = serviceLabel || t('notifications.report');
    const action =
      n.type === 'resolution'
        ? t('notifications.resolved')
        : n.type === 'rejection'
          ? t('notifications.rejected')
          : t('notifications.updated');
    return `${issueType} ${action}`;
  };

  const unreadCount = list.filter((n) => !n.read).length;
  const pageSize = DEFAULT_PAGE_SIZE;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }, [list, currentPage, pageSize]);
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
          {t('nav.notifications')}
        </h1>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAll}
            disabled={markingAll}
            className="btn btn-outline text-sm w-fit"
          >
            {markingAll ? t('common.loading') : t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="card text-center py-16 px-6 w-full">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">{t('notifications.empty')}</p>
        </div>
      ) : (
        <>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full list-none p-0 m-0">
          {paginatedList.map((n) => (
            <li key={n.id} className="min-w-0">
              <div
                className={`card card-flat flex flex-col h-full py-4 px-4 ${!n.read ? 'ring-2 ring-primary-200 dark:ring-primary-800' : ''}`}
              >
                <p className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2" title={n.message}>
                  {getSummary(n)}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{formatDate(n.created_at)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {n.related_report_id && (
                    <Link
                      to={isCitizen ? `/citizen/reports/${n.related_report_id}` : `/agency/reports/${n.related_report_id}`}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      onClick={() => markOne(n.id)}
                    >
                      {t('notifications.viewReport')} →
                    </Link>
                  )}
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markOne(n.id)}
                      className="btn btn-outline text-xs"
                    >
                      {t('notifications.markRead')}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Pagination
            totalItems={list.length}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
          />
        </div>
        </>
      )}
    </div>
  );
}
