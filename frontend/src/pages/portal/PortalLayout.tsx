import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import PortalSidebar from './PortalSidebar';
import PortalToolbar from './PortalToolbar';
import { getPortalToken } from '../../services/portal';

export function PortalLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLightSurfaceMode, setIsLightSurfaceMode] = useState(false);
  const token = getPortalToken();

  if (!token) {
    return <Navigate to="/portal/login" replace />;
  }

  return (
    <main className={`screen dashboard-screen ${isMobileSidebarOpen ? 'dashboard-screen--sidebar-open' : ''} ${isLightSurfaceMode ? 'dashboard-screen--light' : ''}`}>
      <button
        type="button"
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'sidebar-overlay--visible' : ''}`}
        aria-label="Fechar menu lateral"
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <PortalSidebar />

      <section className="dashboard-content">
        <PortalToolbar
          isLightSurfaceMode={isLightSurfaceMode}
          onToggleSurfaceMode={() => setIsLightSurfaceMode(!isLightSurfaceMode)}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          mobileSidebarOpen={isMobileSidebarOpen}
        />
        <Outlet />
      </section>
    </main>
  );
}
