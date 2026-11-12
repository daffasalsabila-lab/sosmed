import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function ProtectedRoute() {
  const { user, loading, endReason } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    const notice =
      endReason === 'logout'
        ? null
        : endReason === 'expired'
          ? 'Sesi Anda berakhir. Silakan login kembali.'
          : 'Silakan login terlebih dahulu untuk mengakses halaman ini.';
    return <Navigate to="/login" replace state={{ from: location, notice }} />;
  }

  return <Outlet />;
}
