import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useTranslation } from '../i18n/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import DashboardLayout, { DASHBOARD_ICONS } from './DashboardLayout';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, logout, isAuthenticated, isCitizen, isAgency, isAdmin } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCitizenDashboard = location.pathname.startsWith('/citizen/');
  const isAgencyDashboard = location.pathname.startsWith('/agency/');

  if (isCitizenDashboard && isCitizen()) {
    return (
      <DashboardLayout
        roleLabel={t('nav.roleCitizen')}
        navItems={[
          { to: '/citizen/dashboard', label: t('nav.dashboard'), icon: <DASHBOARD_ICONS.DashboardIcon /> },
          { to: '/citizen/report', label: t('nav.submitReport'), icon: <DASHBOARD_ICONS.ReportIcon /> },
          { to: '/citizen/reports', label: t('nav.myReports'), icon: <DASHBOARD_ICONS.ReportsIcon /> },
          { to: '/citizen/profile', label: t('nav.profile'), icon: <DASHBOARD_ICONS.ProfileIcon /> },
        ]}
      >
        {children}
      </DashboardLayout>
    );
  }

  if (isAgencyDashboard && (isAgency() || isAdmin())) {
    return (
      <DashboardLayout
        roleLabel={t('nav.roleAgency')}
        navItems={[
          { to: '/agency/dashboard', label: t('nav.dashboard'), icon: <DASHBOARD_ICONS.DashboardIcon /> },
          { to: '/agency/alerts', label: t('nav.alerts'), icon: <DASHBOARD_ICONS.AlertIcon /> },
          { to: '/agency/reports', label: t('nav.reports'), icon: <DASHBOARD_ICONS.ReportsIcon /> },
          { to: '/agency/profile', label: t('nav.profile'), icon: <DASHBOARD_ICONS.ProfileIcon /> },
        ]}
      >
        {children}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="container-main">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
                ServicePulse
              </Link>
              {isAuthenticated() && (
                <div className="ml-8 flex space-x-4">
                  {isCitizen() && (
                    <>
                      <Link to="/citizen/dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                        {t('nav.dashboard')}
                      </Link>
                      <Link to="/citizen/report" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                        {t('nav.submitReport')}
                      </Link>
                      <Link to="/citizen/reports" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                        {t('nav.myReports')}
                      </Link>
                    </>
                  )}
                  {isAgency() && (
                    <>
                      <Link to="/agency/dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                        {t('nav.dashboard')}
                      </Link>
                      <Link to="/agency/alerts" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                        {t('nav.alerts')}
                      </Link>
                      <Link to="/agency/reports" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                        {t('nav.reports')}
                      </Link>
                      <Link to="/agency/profile" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                        {t('nav.profile')}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/"
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {t('nav.home')}
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
              </button>
              <LanguageSwitcher />
              {isAuthenticated() ? (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-xs shrink-0">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (() => {
                        const n = user?.fullName || user?.email || user?.phoneNumber || '?';
                        if (!n || n.trim() === '') return '?';
                        const parts = n.trim().split(/\s+/);
                        return parts.length >= 2
                          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                          : n.slice(0, 2).toUpperCase();
                      })()
                    )}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user?.fullName}</span>
                  <button onClick={handleLogout} className="btn btn-outline text-sm">
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="btn btn-outline text-sm">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="btn btn-primary text-sm">
                    {t('nav.signUp')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 pt-16">{children}</main>
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-8">
        <div className="container-main">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.copyright').replace('{{year}}', String(new Date().getFullYear()))}
            </p>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                {t('common.terms')}
              </Link>
              <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                {t('common.privacy')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
