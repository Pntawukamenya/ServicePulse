import { ReactNode, useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCitizenDashboard = location.pathname.startsWith('/citizen/');
  const isAgencyDashboard = location.pathname.startsWith('/agency/');
  const isNotificationsPage = location.pathname === '/notifications';

  if (isNotificationsPage && isAuthenticated()) {
    if (isCitizen()) {
      return (
        <DashboardLayout
          roleLabel={t('nav.roleCitizen')}
          navItems={[
            { to: '/citizen/dashboard', label: t('nav.dashboard'), icon: <DASHBOARD_ICONS.DashboardIcon /> },
            { to: '/citizen/report', label: t('nav.submitReport'), icon: <DASHBOARD_ICONS.ReportIcon /> },
            { to: '/citizen/reports', label: t('nav.myReports'), icon: <DASHBOARD_ICONS.ReportsIcon /> },
            { to: '/notifications', label: t('nav.notifications'), icon: <DASHBOARD_ICONS.AlertIcon /> },
            { to: '/citizen/profile', label: t('nav.profile'), icon: <DASHBOARD_ICONS.ProfileIcon /> },
          ]}
        >
          {children}
        </DashboardLayout>
      );
    }
    if (isAgency() || isAdmin()) {
      const agencyNavItems = [
        { to: '/agency/dashboard', label: t('nav.dashboard'), icon: <DASHBOARD_ICONS.DashboardIcon /> },
        { to: '/agency/alerts', label: t('nav.alerts'), icon: <DASHBOARD_ICONS.AlertIcon /> },
        { to: '/agency/reports', label: t('nav.reports'), icon: <DASHBOARD_ICONS.ReportsIcon /> },
        ...(user?.role === 'agency_admin' || user?.role === 'super_admin'
          ? [{ to: '/agency/approvals', label: t('nav.approvals'), icon: <DASHBOARD_ICONS.ApprovalsIcon /> }]
          : []),
        { to: '/agency/analytics', label: t('nav.analytics'), icon: <DASHBOARD_ICONS.ChartIcon /> },
        { to: '/notifications', label: t('nav.notifications'), icon: <DASHBOARD_ICONS.AlertIcon /> },
        { to: '/agency/profile', label: t('nav.profile'), icon: <DASHBOARD_ICONS.ProfileIcon /> },
      ];
      const isAgencyAdminRole = ['agency_admin', 'super_admin', 'admin'].includes(user?.role || '');
      const agencyName = user?.agencyCode || t('nav.roleAgency');
      const agencyRoleLabel = isAgencyAdminRole
        ? `${agencyName} – Admin`
        : user?.agencyRole
          ? `${agencyName} – ${user.agencyRole}`
          : agencyName;
      return (
        <DashboardLayout roleLabel={agencyRoleLabel} navItems={agencyNavItems}>
          {children}
        </DashboardLayout>
      );
    }
  }

  if (isCitizenDashboard && isCitizen()) {
    return (
      <DashboardLayout
        roleLabel={t('nav.roleCitizen')}
        navItems={[
          { to: '/citizen/dashboard', label: t('nav.dashboard'), icon: <DASHBOARD_ICONS.DashboardIcon /> },
          { to: '/citizen/report', label: t('nav.submitReport'), icon: <DASHBOARD_ICONS.ReportIcon /> },
          { to: '/citizen/reports', label: t('nav.myReports'), icon: <DASHBOARD_ICONS.ReportsIcon /> },
          { to: '/notifications', label: t('nav.notifications'), icon: <DASHBOARD_ICONS.AlertIcon /> },
          { to: '/citizen/profile', label: t('nav.profile'), icon: <DASHBOARD_ICONS.ProfileIcon /> },
        ]}
      >
        {children}
      </DashboardLayout>
    );
  }

  if (isAgencyDashboard && (isAgency() || isAdmin())) {
    const agencyNavItems = [
      { to: '/agency/dashboard', label: t('nav.dashboard'), icon: <DASHBOARD_ICONS.DashboardIcon /> },
      { to: '/agency/alerts', label: t('nav.alerts'), icon: <DASHBOARD_ICONS.AlertIcon /> },
      { to: '/agency/reports', label: t('nav.reports'), icon: <DASHBOARD_ICONS.ReportsIcon /> },
      ...(user?.role === 'agency_admin' || user?.role === 'super_admin'
        ? [{ to: '/agency/approvals', label: t('nav.approvals'), icon: <DASHBOARD_ICONS.ApprovalsIcon /> }]
        : []),
      { to: '/agency/analytics', label: t('nav.analytics'), icon: <DASHBOARD_ICONS.ChartIcon /> },
      { to: '/notifications', label: t('nav.notifications'), icon: <DASHBOARD_ICONS.AlertIcon /> },
      { to: '/agency/profile', label: t('nav.profile'), icon: <DASHBOARD_ICONS.ProfileIcon /> },
    ];
    const isAgencyAdminRole = ['agency_admin', 'super_admin', 'admin'].includes(user?.role || '');
    const agencyName = user?.agencyCode || t('nav.roleAgency');
    const agencyRoleLabel = isAgencyAdminRole
      ? `${agencyName} – Admin`
      : user?.agencyRole
        ? `${agencyName} – ${user.agencyRole}`
        : agencyName;
    return (
      <DashboardLayout
        roleLabel={agencyRoleLabel}
        navItems={agencyNavItems}
      >
        {children}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
        <div className="container-main">
          <div className="flex justify-between items-center h-16 sm:h-[4.25rem]">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400 transition-colors hover:text-primary-700 dark:hover:text-primary-300">
                ServicePulse
              </Link>
              {isAuthenticated() && (
                <div className="hidden md:flex items-center gap-1">
                  {isCitizen() && (
                    <>
                      <Link to="/citizen/dashboard" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors">
                        {t('nav.dashboard')}
                      </Link>
                      <Link to="/citizen/report" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors">
                        {t('nav.submitReport')}
                      </Link>
                      <Link to="/citizen/reports" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors">
                        {t('nav.myReports')}
                      </Link>
                      <Link to="/notifications" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors">
                        {t('nav.notifications')}
                      </Link>
                    </>
                  )}
                  {(isAgency() || isAdmin()) && (
                    <>
                      <Link to="/agency/dashboard" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors">
                        {t('nav.dashboard')}
                      </Link>
                      <Link to="/agency/alerts" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors">
                        {t('nav.alerts')}
                      </Link>
                      <Link to="/agency/reports" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors">
                        {t('nav.reports')}
                      </Link>
                      {(user?.role === 'agency_admin' || user?.role === 'super_admin') && (
                        <Link to="/agency/approvals" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors">
                          {t('nav.approvals')}
                        </Link>
                      )}
                      <Link to="/agency/analytics" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors">
                        {t('nav.analytics')}
                      </Link>
                      <Link to="/notifications" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors">
                        {t('nav.notifications')}
                      </Link>
                      <Link to="/agency/profile" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors">
                        {t('nav.profile')}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/"
                className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors"
              >
                {t('nav.home')}
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
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
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm shrink-0 ring-2 ring-neutral-100 dark:ring-neutral-800">
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
                  <span className="hidden sm:inline text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[120px]">{user?.fullName}</span>
                  <button onClick={handleLogout} className="btn btn-outline text-sm py-2">
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn btn-outline text-sm py-2">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="btn btn-primary text-sm py-2">
                    {t('nav.signUp')}
                  </Link>
                </div>
              )}

              {isAuthenticated() && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>

          {mobileMenuOpen && isAuthenticated() && (
            <div className="md:hidden py-4 border-t border-neutral-200 dark:border-neutral-800 animate-fade-in">
              <div className="flex flex-col gap-1">
{isCitizen() && (
                    <>
                      <Link to="/citizen/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        {t('nav.dashboard')}
                      </Link>
                      <Link to="/citizen/report" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        {t('nav.submitReport')}
                      </Link>
                      <Link to="/citizen/reports" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        {t('nav.myReports')}
                      </Link>
                      <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        {t('nav.notifications')}
                      </Link>
                    </>
                  )}
{(isAgency() || isAdmin()) && (
                    <>
                      <Link to="/agency/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        {t('nav.dashboard')}
                      </Link>
                      <Link to="/agency/alerts" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        {t('nav.alerts')}
                      </Link>
                      <Link to="/agency/reports" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        {t('nav.reports')}
                      </Link>
                      {(user?.role === 'agency_admin' || user?.role === 'super_admin') && (
                        <Link to="/agency/approvals" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                          {t('nav.approvals')}
                        </Link>
                      )}
                      <Link to="/agency/analytics" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        {t('nav.analytics')}
                      </Link>
                      <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        {t('nav.notifications')}
                      </Link>
                      <Link to="/agency/profile" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        {t('nav.profile')}
                      </Link>
                    </>
                  )}
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  {t('nav.home')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="flex-1 pt-16 sm:pt-[4.25rem]">{children}</main>
      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-8">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t('common.copyright').replace('{{year}}', String(new Date().getFullYear()))}
            </p>
            <div className="flex gap-6">
              <Link to="/terms" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {t('common.terms')}
              </Link>
              <Link to="/privacy" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {t('common.privacy')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
