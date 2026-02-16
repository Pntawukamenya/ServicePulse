import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';
import api from '../lib/api';
import AnimatedCounter from '../components/AnimatedCounter';

export default function About() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ totalReports: 0, resolvedReports: 0, totalAlerts: 0 });

  useEffect(() => {
    api.get('/stats/public').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const sections = [
    { key: 'mission', icon: '🎯', titleKey: 'mission' as const, textKey: 'missionText' as const },
    { key: 'challenge', icon: '🌍', titleKey: 'challenge' as const, textKey: 'challengeText' as const },
    { key: 'solution', icon: '💡', titleKey: 'solution' as const, textKey: 'solutionText' as const, listKeys: ['solution1', 'solution2', 'solution3', 'solution4'] as const },
    { key: 'vision', icon: '🔭', titleKey: 'vision' as const, textKey: 'visionText' as const },
  ];

  return (
    <div className="container-main py-12 lg:py-16">
      <h1 className="text-4xl font-bold mb-4">{t('about.title')}</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-12 max-w-2xl">
        {t('about.missionText')}
      </p>

      {/* Impact metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400"><AnimatedCounter end={stats.totalReports} /></p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Reports Submitted</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400"><AnimatedCounter end={stats.resolvedReports} /></p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Issues Resolved</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400"><AnimatedCounter end={stats.totalAlerts} /></p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Alerts Sent</p>
        </div>
        <div className="card text-center col-span-2 md:col-span-1">
          <Link to="/" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Emergency Hotlines →</Link>
        </div>
      </div>

      <div className="space-y-12 text-neutral-700 dark:text-neutral-300">
        {sections.filter((s) => s.key !== 'mission').map((sec) => (
          <section key={sec.key} className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-2xl shrink-0">{sec.icon}</div>
              <div>
                <h2 className="text-xl font-semibold mb-3">{t(`about.${sec.titleKey}`)}</h2>
                <p className="mb-4">{t(`about.${sec.textKey}`)}</p>
                {sec.listKeys && (
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    {sec.listKeys.map((k) => (
                      <li key={k}>{t(`about.${k}`)}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
