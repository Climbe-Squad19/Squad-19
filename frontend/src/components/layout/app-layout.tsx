import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Navigate, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ProfileDrawer from '../ProfileDrawer';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { closeNotifications, openNotifications } from '../../store/uiSlice';
import type { ProposalColumn } from '../../types';
import { ACCESS_TOKEN_KEY } from '../../services/api';
import LogoutConfirmModal from '../modals/logout-confirm-modal';
import NotificationMenu from '../notifications/notification-menu';
import ProfileMenu from '../profile/profile-menu';
import { useNotifications } from '../../hooks/use-notifications';
import Sidebar from './sidebar';
import Toolbar from './toolbar';

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useAppSelector((state) => state.profile);
  const { notificationMessage, showNotifications } = useAppSelector((state) => state.ui);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') ?? '';
  const setSearch = (value: string) => setSearchParams(value ? { q: value } : {});

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState<HTMLElement | null>(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<HTMLElement | null>(null);
  const [isLightSurfaceMode, setIsLightSurfaceMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const emptyProposalColumns = useMemo<ProposalColumn[]>(() => [], []);
  const { notificationItems, pushNotification } = useNotifications({
    filteredAgendaItemsCount: 0,
    filteredUpcomingItemsCount: 0,
    filteredProposalColumns: emptyProposalColumns,
    notificationMessage,
    showNotifications,
  });

  const userInitials = profile.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  function handleConfirmLogout() {
    setShowLogoutConfirm(false);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    navigate('/login');
  }

  function handleOpenProfileMenu(event: MouseEvent<HTMLButtonElement>) {
    setProfileMenuAnchor(event.currentTarget);
  }

  const routeTitleMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/agenda': 'Agenda',
    '/propostas': 'Propostas comerciais',
    '/empresas': 'Clientes / Empresas',
    '/equipe': 'Equipe',
    '/configuracoes': 'Configurações',
  };

  const currentTitle = routeTitleMap[location.pathname] ?? 'Dashboard';

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

      <Sidebar
        search={search}
        onSearch={setSearch}
        cadastrosPendentesCount={0}
        podeGerenciarCadastros={profile.podeGerenciarCadastros}
        onLogout={() => setShowLogoutConfirm(true)}
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <section className="dashboard-content">
        <Toolbar
          onOpenProfile={handleOpenProfileMenu}
          notificationItems={notificationItems}
          pushNotification={pushNotification}
          onOpenNotifications={(event) => {
            dispatch(openNotifications(`Painel de notificações aberto em ${currentTitle}.`));
            setNotificationsAnchor(event.currentTarget);
          }}
          userInitials={userInitials}
          fullName={profile.fullName}
          role={profile.role}
          isLightSurfaceMode={isLightSurfaceMode}
          onToggleSurfaceMode={() => setIsLightSurfaceMode((current) => !current)}
          onToggleSidebar={() => setIsMobileSidebarOpen((current) => !current)}
          mobileSidebarOpen={isMobileSidebarOpen}
        />

        <header className="dashboard-header">
          <div>
            <p>Bem vindo(a) de volta, {profile.fullName.split(' ')[0] ?? profile.fullName}</p>
            <h1>{currentTitle} / Visão geral</h1>
          </div>
        </header>

        <Outlet context={{ search }} />
      </section>

      <LogoutConfirmModal open={showLogoutConfirm} onConfirm={handleConfirmLogout} onCancel={() => setShowLogoutConfirm(false)} />
      <ProfileDrawer open={profileDrawerOpen} onClose={() => setProfileDrawerOpen(false)} />
      <NotificationMenu
        anchorEl={notificationsAnchor}
        items={notificationItems}
        onClose={() => {
          setNotificationsAnchor(null);
          dispatch(closeNotifications());
        }}
        onAdjust={() => {
          setNotificationsAnchor(null);
          navigate('/configuracoes');
        }}
      />
      <ProfileMenu
        anchorEl={profileMenuAnchor}
        onClose={() => setProfileMenuAnchor(null)}
        onOpenProfile={() => {
          setProfileMenuAnchor(null);
          setProfileDrawerOpen(true);
        }}
        onSettings={() => {
          setProfileMenuAnchor(null);
          navigate('/configuracoes');
        }}
        onLogout={() => {
          setProfileMenuAnchor(null);
          setShowLogoutConfirm(true);
        }}
        fullName={profile.fullName}
        email={profile.email}
        userInitials={userInitials}
      />
    </main>
  );
}