import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useThemeStore } from './store/themeStore';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Citizen pages
import CitizenDashboard from './pages/citizen/Dashboard';
import CitizenReports from './pages/citizen/Reports';
import ReportDetail from './pages/ReportDetail';

// Agency pages
import AgencyDashboard from './pages/agency/Dashboard';
import AgencyReports from './pages/agency/Reports';
import AgencyProfile from './pages/agency/Profile';
import AgencyApprovals from './pages/agency/Approvals';

// Lazy-loaded pages (contain Rwanda locations ~230KB)
const Register = lazy(() => import('./pages/Register'));
const CitizenReport = lazy(() => import('./pages/citizen/Report'));
const CitizenProfile = lazy(() => import('./pages/citizen/Profile'));
const AgencyAlerts = lazy(() => import('./pages/agency/Alerts'));

function App() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<div className="flex min-h-[200px] items-center justify-center text-neutral-500 dark:text-neutral-400">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route
            path="/citizen/dashboard"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/report"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/reports"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/reports/:id"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <ReportDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/profile"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agency/dashboard"
            element={
              <ProtectedRoute allowedRoles={['agency', 'agency_employee', 'agency_admin', 'admin', 'super_admin']}>
                <AgencyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/alerts"
            element={
              <ProtectedRoute allowedRoles={['agency', 'agency_employee', 'agency_admin', 'admin', 'super_admin']}>
                <AgencyAlerts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/reports"
            element={
              <ProtectedRoute allowedRoles={['agency', 'agency_employee', 'agency_admin', 'admin', 'super_admin']}>
                <AgencyReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/reports/:id"
            element={
              <ProtectedRoute allowedRoles={['agency', 'agency_employee', 'agency_admin', 'admin', 'super_admin']}>
                <ReportDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/profile"
            element={
              <ProtectedRoute allowedRoles={['agency', 'agency_employee', 'agency_admin', 'admin', 'super_admin']}>
                <AgencyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/approvals"
            element={
              <ProtectedRoute allowedRoles={['agency_admin', 'super_admin']}>
                <AgencyApprovals />
              </ProtectedRoute>
            }
          />
        </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
