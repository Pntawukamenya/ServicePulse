import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useThemeStore } from './store/themeStore';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Citizen pages
import CitizenDashboard from './pages/citizen/Dashboard';
import CitizenReport from './pages/citizen/Report';
import CitizenReports from './pages/citizen/Reports';
import CitizenProfile from './pages/citizen/Profile';

// Agency pages
import AgencyDashboard from './pages/agency/Dashboard';
import AgencyAlerts from './pages/agency/Alerts';
import AgencyReports from './pages/agency/Reports';
import AgencyProfile from './pages/agency/Profile';

function App() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return (
    <BrowserRouter>
      <Layout>
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
            path="/agency/profile"
            element={
              <ProtectedRoute allowedRoles={['agency', 'agency_employee', 'agency_admin', 'admin', 'super_admin']}>
                <AgencyProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
