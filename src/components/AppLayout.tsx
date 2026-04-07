import { Suspense, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Sidebar } from './Sidebar';
import { clearSidebarProfileCache } from '../lib/sidebarCache';
import { useBodyClass } from '../hooks/useBodyClass';
import { PageFallback } from './PageFallback';

export function AppLayout() {
  useBodyClass('app-body');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    const id = user?.id;
    if (id) clearSidebarProfileCache(id);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`app-shell${collapsed ? ' app-shell--collapsed' : ''}`} id="appShell">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onLogout={handleLogout}
      />
      <div className="app-content">
        <Suspense fallback={<PageFallback />}>
          <Outlet context={{ onLogout: handleLogout }} />
        </Suspense>
      </div>
    </div>
  );
}
