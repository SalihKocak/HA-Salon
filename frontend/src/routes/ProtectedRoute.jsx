import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ROLES, MEMBER_STATUS } from '../utils/constants';

export function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user?.role !== ROLES.ADMIN) return <Navigate to="/" replace />;

  return children;
}

export function DeveloperRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user?.role !== ROLES.DEVELOPER) return <Navigate to="/" replace />;

  return children;
}

export function MemberRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  // Admin yanlışlıkla member rotasına gelirse admin paneline yönlendir
  if (user?.role === ROLES.ADMIN) return <Navigate to="/admin" replace />;
  if (user?.role === ROLES.DEVELOPER) return <Navigate to="/developer" replace />;

  // Member rolü ama onay bekleniyor veya reddedildi
  if (user?.status === MEMBER_STATUS.PENDING) return <Navigate to="/pending" replace />;
  if (user?.status === MEMBER_STATUS.REJECTED) return <Navigate to="/rejected" replace />;
  if (user?.status === MEMBER_STATUS.SUSPENDED) return <Navigate to="/suspended" replace />;

  // Member ve Approved — erişime izin ver
  return children;
}

export function AuthRoute({ children }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Uygulama initialize edilene kadar login sayfasını göster, yönlendirme yapma
  if (isLoading) return <LoadingScreen />;

  // Zaten giriş yapmışsa ilgili panele yönlendir
  if (isAuthenticated && user) {
    if (user.role === ROLES.ADMIN) return <Navigate to="/admin" replace />;
    if (user.role === ROLES.DEVELOPER) return <Navigate to="/developer" replace />;
    if (user.status === MEMBER_STATUS.PENDING) return <Navigate to="/pending" replace />;
    if (user.status === MEMBER_STATUS.REJECTED) return <Navigate to="/rejected" replace />;
    if (user.status === MEMBER_STATUS.SUSPENDED) return <Navigate to="/suspended" replace />;
    if (user.role === ROLES.MEMBER) return <Navigate to="/member" replace />;
  }

  return children;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
