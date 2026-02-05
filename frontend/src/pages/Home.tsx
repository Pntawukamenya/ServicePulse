import { Link } from 'react-router-dom';
import {
  SmsIcon,
  ReportIcon,
  AgencyIcon,
  ElectricityIcon,
  WaterIcon,
  EmergencyIcon,
} from '../components/icons/HomeIcons';
import { useTranslation } from '../i18n/useTranslation';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-primary-50/30 to-white dark:from-primary-950/40 dark:via-primary-950/20 dark:to-gray-900" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,108,180,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,108,180,0.2),transparent)]" aria-hidden />
        <div className="absolute top-24 left-1/4 w-64 h-64 bg-primary-200/30 dark:bg-primary-500/10 rounded-full blur-3xl" aria-hidden />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-primary-300/20 dark:bg-primary-600/10 rounded-full blur-3xl" aria-hidden />
        <div className="relative container-main py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <span className="inline-block w-12 h-1 rounded-full bg-primary-600 dark:bg-primary-400" aria-hidden />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-bold tracking-tight leading-tight mb-10 bg-gradient-to-r from-gray-800 via-primary-700 to-primary-600 dark:from-white dark:via-primary-200 dark:to-primary-400 bg-clip-text text-transparent">
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
