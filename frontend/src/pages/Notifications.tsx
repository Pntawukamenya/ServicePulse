import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useTranslation } from '../i18n/useTranslation';
import { useAuthStore } from '../store/authStore';

interface UserNotification {
  id: string;
  message: string;
  related_report_id: string | null;
  read: boolean;
  type: string;
  created_at: string;
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const isCitizen = useAuthStore((s) => s.isCitizen?.() ?? true);
  const [list, setList] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

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

  const unreadCount = list.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
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
        <div className="card text-center py-16 px-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">{t('notifications.empty')}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((n) => (
            <li key={n.id}>
              <div
                className={`card card-flat flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 ${!n.read ? 'ring-2 ring-primary-200 dark:ring-primary-800' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-neutral-900 dark:text-white">{n.message}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{formatDate(n.created_at)}</p>
                  {n.related_report_id && (
                    <Link
                      to={isCitizen ? `/citizen/reports/${n.related_report_id}` : `/agency/reports/${n.related_report_id}`}
                      className="inline-block mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      onClick={() => markOne(n.id)}
                    >
                      {t('notifications.viewReport')} →
                    </Link>
                  )}
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markOne(n.id)}
                    className="btn btn-outline text-xs shrink-0"
                  >
                    {t('notifications.markRead')}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
