import { useState } from "react";
import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../store/hooks"; // Importante: conectando o Redux
import Toolbar from "../../components/layout/toolbar";
import Sidebar from "../../components/layout/sidebar";
import { ACCESS_TOKEN_KEY } from "../../services/api";

export function AppLayout() {
  // 1. Busca e URL
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') ?? '';

  const handleSearch = (value: string) => {
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  // 2. Resgatando os dados do Redux (que estavam no monolito antigo)
  const profile = useAppSelector((state) => state.profile);

  // 3. Estados locais de controle da casca do layout
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLightSurfaceMode, setIsLightSurfaceMode] = useState(false);

  // 4. Lógica derivada (iniciais do usuário para o Avatar)
  const userInitials = profile?.fullName
    ?.split(' ')
    ?.filter(Boolean)
    ?.slice(0, 2)
    ?.map((part) => part[0]?.toUpperCase() ?? '')
    ?.join('') || 'U';

  const token = localStorage.getItem(ACCESS_TOKEN_KEY)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className={`screen dashboard-screen ${isMobileSidebarOpen ? 'dashboard-screen--sidebar-open' : ''} ${isLightSurfaceMode ? 'dashboard-screen--light' : ''}`}>

      <button
        type="button"
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'sidebar-overlay--visible' : ''}`}
        aria-label="Fechar menu lateral"
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <Sidebar isLightMode={isLightSurfaceMode} />

      <section className="dashboard-content">
        <Toolbar
          fullName={profile?.fullName || 'Usuário'}
          role={profile?.role || 'Cargo'}
          userInitials={userInitials}
          isLightSurfaceMode={isLightSurfaceMode}
          onToggleSurfaceMode={() => setIsLightSurfaceMode(!isLightSurfaceMode)}
          mobileSidebarOpen={isMobileSidebarOpen}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}

          onOpenProfile={() => console.log('Abrir perfil')}
          onOpenNotifications={() => console.log('Abrir notificações')}
          pushNotification={() => { }}
          notificationItems={[]}
        />

        <Outlet context={{ search }} />
      </section>
    </main>
  );
}