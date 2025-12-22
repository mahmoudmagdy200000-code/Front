import './i18n/i18n';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { LoadingSpinner } from './components/ui';

import ScrollToTop from './components/ScrollToTop';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const ChaletDetailPage = lazy(() => import('./pages/ChaletDetailPage'));
const OwnerLoginPage = lazy(() => import('./pages/OwnerLoginPage'));
const OwnerRegisterPage = lazy(() => import('./pages/OwnerRegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const ChaletBookingsPage = lazy(() => import('./pages/ChaletBookingsPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const ClientDashboardPage = lazy(() => import('./pages/ClientDashboardPage'));
const EarningsPage = lazy(() => import('./pages/EarningsPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <ScrollToTop />
          <Suspense fallback={<LoadingSpinner fullScreen text="Loading..." />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/searchchalet" element={<SearchResultsPage />} />
              <Route path="/chalets" element={<SearchResultsPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/chalet/:id" element={<ChaletDetailPage />} />
              <Route path="/owner/login" element={<OwnerLoginPage />} />
              <Route path="/owner/register" element={<OwnerRegisterPage />} />
              <Route path="/terms-and-conditions" element={<TermsPage />} />

              {/* Owner Dashboard (Owner only) */}
              <Route
                path="/owner/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/dashboard/chalet/:id"
                element={
                  <ProtectedRoute>
                    <ChaletBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/earnings"
                element={
                  <ProtectedRoute>
                    <EarningsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Dashboard (Admin only) */}
              <Route
                path="/admin/owner-requests"
                element={
                  <ProtectedRoute requireOwner={false}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Client Dashboard (Client only) */}
              <Route
                path="/client/dashboard"
                element={
                  <ProtectedRoute requireOwner={false}>
                    <ClientDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
