import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SmsIcon,
  ReportIcon,
  AgencyIcon,
  ElectricityIcon,
  WaterIcon,
  EmergencyIcon,
} from '../components/icons/HomeIcons';
import AnimatedCounter from '../components/AnimatedCounter';
import { useTranslation } from '../i18n/useTranslation';
import api from '../lib/api';

interface PublicStats {
  totalReports: number;
  resolvedReports: number;
  totalAlerts: number;
  citizensServed: number;
}

export default function Home() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<PublicStats>({ totalReports: 0, resolvedReports: 0, totalAlerts: 0, citizensServed: 0 });
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    api.get('/stats/public').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-primary-50/30 to-white dark:from-primary-950/40 dark:via-primary-950/20 dark:to-gray-900" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,108,180,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,108,180,0.2),transparent)]" aria-hidden />
        <div className="absolute top-24 left-1/4 w-64 h-64 bg-primary-200/30 dark:bg-primary-500/10 rounded-full blur-3xl" aria-hidden />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-primary-300/20 dark:bg-primary-600/10 rounded-full blur-3xl" aria-hidden />
        <div className="relative max-w-7xl xl:max-w-[96rem] 2xl:max-w-[100rem] mx-auto px-8 sm:px-12 lg:px-12 xl:px-10 2xl:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <span className="inline-block w-12 h-1 rounded-full bg-primary-600 dark:bg-primary-400" aria-hidden />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-10 bg-gradient-to-r from-gray-900 via-primary-700 to-primary-600 dark:from-white dark:via-primary-200 dark:to-primary-400 bg-clip-text text-transparent" style={{ fontWeight: 900 }}>
              {t('home.subtitle')}
            </h1>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/25 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
              >
                {t('home.getStarted')}
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-primary-600 bg-white dark:bg-gray-800/50 border-2 border-primary-600 rounded-xl hover:bg-primary-50 dark:border-primary-500 dark:text-primary-400 dark:hover:bg-primary-900/20 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
              >
                {t('home.learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform impact stats - FixMyStreet/SeeClickFix style transparency */}
      <section className="py-12 sm:py-16 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container-main">
          <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400 text-center mb-8">
            {t('home.impactStats')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400">
                <AnimatedCounter end={stats.totalReports} />
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('home.reportsSubmitted')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400">
                <AnimatedCounter end={stats.resolvedReports} />
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('home.issuesResolved')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-400">
                <AnimatedCounter end={stats.totalAlerts} />
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('home.alertsSent')}</p>
            </div>
            <div className="text-center col-span-2 md:col-span-1">
              <p className="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400">
                <AnimatedCounter end={stats.citizensServed} />
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Citizens Served</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 lg:py-20">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 lg:p-8 hover:shadow-lg hover:border-primary-100 dark:hover:border-primary-900/50 transition-all duration-300">
              <div className="flex justify-center mb-5">
                <div className="text-primary-600 dark:text-primary-400">
                  <SmsIcon size={56} />
                </div>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
                {t('home.smsAlerts')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed text-center">
                {t('home.smsAlertsDesc')}
              </p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 lg:p-8 hover:shadow-lg hover:border-primary-100 dark:hover:border-primary-900/50 transition-all duration-300">
              <div className="flex justify-center mb-5">
                <div className="text-primary-600 dark:text-primary-400">
                  <ReportIcon size={56} />
                </div>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
                {t('home.citizenReporting')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed text-center">
                {t('home.citizenReportingDesc')}
              </p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 lg:p-8 hover:shadow-lg hover:border-primary-100 dark:hover:border-primary-900/50 transition-all duration-300">
              <div className="flex justify-center mb-5">
                <div className="text-primary-600 dark:text-primary-400">
                  <AgencyIcon size={56} />
                </div>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
                {t('home.agencyDashboards')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed text-center">
                {t('home.agencyDashboardsDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 lg:py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container-main">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white text-center mb-10 lg:mb-12">
            {t('home.supportedServices')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 lg:p-8 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 text-primary-600 dark:text-primary-400">
                  <ElectricityIcon size={44} />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                  {t('home.reg')}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed flex-1">
                {t('home.regDesc')}
              </p>
            </div>

            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 lg:p-8 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 text-primary-600 dark:text-primary-400">
                  <WaterIcon size={44} />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                  {t('home.wasac')}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed flex-1">
                {t('home.wasacDesc')}
              </p>
            </div>

            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 lg:p-8 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 text-primary-600 dark:text-primary-400">
                  <EmergencyIcon size={44} />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                  {t('home.emergency')}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed flex-1">
                {t('home.emergencyDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Hotlines - Rwanda standard numbers */}
      <section className="py-12 sm:py-14 lg:py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container-main">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">
            {t('home.emergencyHotlines')}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('home.emergencyHotlinesDesc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <a href="tel:112" className="card text-center hover:border-red-200 dark:hover:border-red-900/50 group">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50">
                <EmergencyIcon size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">{t('home.policeEmergency')}</p>
              <p className="text-lg font-mono font-bold text-primary-600 dark:text-primary-400">112</p>
            </a>
            <a href="tel:112" className="card text-center hover:border-amber-200 dark:hover:border-amber-900/50 group">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">{t('home.fireAmbulance')}</p>
              <p className="text-lg font-mono font-bold text-primary-600 dark:text-primary-400">112</p>
            </a>
            <a href="tel:3023" className="card text-center hover:border-yellow-200 dark:hover:border-yellow-900/50 group">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <ElectricityIcon size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">{t('home.regHotline')}</p>
              <p className="text-lg font-mono font-bold text-primary-600 dark:text-primary-400">3023</p>
            </a>
            <a href="tel:3015" className="card text-center hover:border-blue-200 dark:hover:border-blue-900/50 group">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <WaterIcon size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">{t('home.wasacHotline')}</p>
              <p className="text-lg font-mono font-bold text-primary-600 dark:text-primary-400">3015</p>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-12 sm:py-14 lg:py-20">
        <div className="container-main max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            {t('home.faq')}
          </h2>
          <div className="space-y-2">
            {[
              { q: 'faq1Q', a: 'faq1A' },
              { q: 'faq2Q', a: 'faq2A' },
              { q: 'faq3Q', a: 'faq3A' },
              { q: 'faq4Q', a: 'faq4A' },
            ].map((item, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-5 py-4 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 flex justify-between items-center"
                >
                  {t(`home.${item.q}`)}
                  <svg className={`w-5 h-5 text-gray-500 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {faqOpen === i && (
                  <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                    {t(`home.${item.a}`)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 lg:py-20">
        <div className="container-main">
          <div className="max-w-4xl mx-auto text-center bg-primary-600 dark:bg-primary-800 rounded-2xl px-6 sm:px-8 py-12 sm:py-14 lg:py-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              {t('home.ctaTitle')}
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              {t('home.ctaSubtitle')}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-primary-600 bg-white rounded-lg hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 transition-colors"
            >
              {t('home.createAccount')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
