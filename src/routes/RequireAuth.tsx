import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-body" style={{ padding: '2rem', textAlign: 'center' }}>
        불러오는 중…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
