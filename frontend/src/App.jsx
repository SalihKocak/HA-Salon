import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useRef } from 'react';
import useAuthStore from './store/authStore';

// Route guards
import { AdminRoute, MemberRoute, AuthRoute, DeveloperRoute } from './routes/ProtectedRoute';

// Public pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import PendingPage from './pages/public/PendingPage';
import RejectedPage from './pages/public/RejectedPage';
import SuspendedPage from './pages/public/SuspendedPage';

// Member pages
import MemberDashboard from './pages/member/MemberDashboard';
import MemberProfilePage from './pages/member/MemberProfilePage';
import MemberProgressPage from './pages/member/MemberProgressPage';
import MemberMembershipPage from './pages/member/MemberMembershipPage';
import MemberSessionsPage from './pages/member/MemberSessionsPage';
import CalorieCalculatorPage from './pages/member/CalorieCalculatorPage';
import MemberAccountSettingsPage from './pages/member/MemberAccountSettingsPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMembersPage from './pages/admin/AdminMembersPage';
import AdminApprovalsPage from './pages/admin/AdminApprovalsPage';
import AdminPackagesPage from './pages/admin/AdminPackagesPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminExpensesPage from './pages/admin/AdminExpensesPage';
import AdminSessionsPage from './pages/admin/AdminSessionsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminWhatsAppPage from './pages/admin/AdminWhatsAppPage';
import AdminPasswordToolsPage from './pages/admin/AdminPasswordToolsPage';
import AdminDataEntryPage from './pages/admin/AdminDataEntryPage';
import AdminDailyVisitorsPage from './pages/admin/AdminDailyVisitorsPage';
import DeveloperPortalPage from './pages/developer/DeveloperPortalPage';

/* ── Sayfa geçişlerini animasyonla saran bileşen ─────────────────────────── */
function PageTransition({ children }) {
  const location = useLocation();
  const wrapperRef = useRef(null);
  const shouldAnimatePage = !(
    location.pathname.startsWith('/admin') || location.pathname.startsWith('/member')
  );

  useEffect(() => {
    if (!shouldAnimatePage) return;
    const el = wrapperRef.current;
    if (!el) return;
    el.classList.remove('page-enter');
    // Reflow tetikle — animasyonun yeniden başlaması için
    void el.offsetWidth;
    el.classList.add('page-enter');
  }, [location.pathname, shouldAnimatePage]);

  return (
    <div ref={wrapperRef} className={shouldAnimatePage ? 'page-enter' : ''} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}

function AppInitializer({ children }) {
  const { initialize, logout } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Axios interceptor'dan gelen session expired event'ini yakala
  // Hard refresh yerine React Router ile yönlendir
  useEffect(() => {
    const handleSessionExpired = async () => {
      await logout();
      const currentPath = window.location.pathname;
      const isProtectedPath =
        currentPath.startsWith('/admin') ||
        currentPath.startsWith('/member') ||
        currentPath.startsWith('/developer') ||
        currentPath === '/pending' ||
        currentPath === '/rejected' ||
        currentPath === '/suspended';

      if (isProtectedPath) {
        // Navigate hook burada kullanılamaz, BrowserRouter dışındayız
        // Bu nedenle yalnızca korumalı rotalarda login'e tam yönlendirme yapıyoruz.
        window.location.replace('/login');
      }
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [logout]);

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInitializer>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#f5f5f5',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#1a1a1a' },
            },
            error: {
              iconTheme: { primary: '#e11d48', secondary: '#1a1a1a' },
            },
          }}
        />

        <PageTransition>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/pending" element={<PendingPage />} />
          <Route path="/rejected" element={<RejectedPage />} />
          <Route path="/suspended" element={<SuspendedPage />} />

          {/* Auth routes - redirect if already logged in */}
          <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
          {/* Register AuthRoute dışında — kayıt sürecinde store güncellenince AuthRoute yönlendirmeyi kesiyor */}
          <Route path="/register" element={<RegisterPage />} />

          {/* Member routes */}
          <Route path="/member" element={<MemberRoute><MemberDashboard /></MemberRoute>} />
          <Route path="/member/profile" element={<MemberRoute><MemberProfilePage /></MemberRoute>} />
          <Route path="/member/progress" element={<MemberRoute><MemberProgressPage /></MemberRoute>} />
          <Route path="/member/membership" element={<MemberRoute><MemberMembershipPage /></MemberRoute>} />
          <Route path="/member/sessions" element={<MemberRoute><MemberSessionsPage /></MemberRoute>} />
          <Route path="/member/calculator" element={<MemberRoute><CalorieCalculatorPage /></MemberRoute>} />
          <Route path="/member/account-settings" element={<MemberRoute><MemberAccountSettingsPage /></MemberRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/members" element={<AdminRoute><AdminMembersPage /></AdminRoute>} />
          <Route path="/admin/approvals" element={<AdminRoute><AdminApprovalsPage /></AdminRoute>} />
          <Route path="/admin/packages" element={<AdminRoute><AdminPackagesPage /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><AdminPaymentsPage /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
          <Route path="/admin/expenses" element={<AdminRoute><AdminExpensesPage /></AdminRoute>} />
          <Route path="/admin/sessions" element={<AdminRoute><AdminSessionsPage /></AdminRoute>} />
          <Route path="/admin/daily-visitors" element={<AdminRoute><AdminDailyVisitorsPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
          <Route path="/admin/whatsapp" element={<AdminRoute><AdminWhatsAppPage /></AdminRoute>} />
          <Route path="/admin/password-tools" element={<AdminRoute><AdminPasswordToolsPage /></AdminRoute>} />
          <Route path="/admin/data-entry" element={<AdminRoute><AdminDataEntryPage /></AdminRoute>} />

          {/* Developer routes */}
          <Route path="/developer" element={<DeveloperRoute><DeveloperPortalPage /></DeveloperRoute>} />
          <Route path="/developer/errors" element={<DeveloperRoute><DeveloperPortalPage /></DeveloperRoute>} />
          <Route path="/developer/members" element={<DeveloperRoute><DeveloperPortalPage /></DeveloperRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </PageTransition>
      </AppInitializer>
    </BrowserRouter>
  );
}
