import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { NotificationFeedItem } from '../../types';

type ToolbarProps = {
  onOpenProfile: (event: MouseEvent<HTMLButtonElement>) => void;
  notificationItems: NotificationFeedItem[];
  pushNotification: (item: Omit<NotificationFeedItem, 'timeLabel'>) => void;
  onOpenNotifications: (event: MouseEvent<HTMLButtonElement>) => void;
  userInitials: string;
  fullName: string;
  role: string;
  isLightSurfaceMode: boolean;
  onToggleSurfaceMode: () => void;
  onToggleSidebar: () => void;
  mobileSidebarOpen: boolean;
};

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/agenda': 'Agenda',
  '/propostas': 'Propostas comerciais',
  '/empresas': 'Clientes / Empresas',
  '/equipe': 'Equipe',
  '/configuracoes': 'Configurações',
};

export default function Toolbar({
  onOpenProfile,
  notificationItems,
  pushNotification,
  onOpenNotifications,
  userInitials,
  fullName,
  role,
  isLightSurfaceMode,
  onToggleSurfaceMode,
  onToggleSidebar,
  mobileSidebarOpen,
}: ToolbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = titleMap[location.pathname] ?? 'Dashboard';

  return (
    <div className="dashboard-toolbar">
      <div className="toolbar-left">
        <button
          type="button"
          className="icon-button mobile-nav-button"
          aria-label={mobileSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={onToggleSidebar}
        >
          ☰
        </button>
        <div className="toolbar-labels">
          <span className="page-label">{pageTitle.toUpperCase()}</span>
          <small>Visão geral</small>
        </div>
      </div>
      <div className="toolbar-actions">
        <button
          type="button"
          className={`button theme-toggle-button ${isLightSurfaceMode ? 'theme-toggle-button--light' : 'theme-toggle-button--dark'}`}
          onClick={onToggleSurfaceMode}
        >
          {isLightSurfaceMode ? 'Modo escuro' : 'Modo claro'}
        </button>
        <button type="button" className="icon-button notification-trigger" aria-label="Notificações" onClick={onOpenNotifications}>
          🔔
          {notificationItems.length > 0 ? <span className="notification-trigger-dot" /> : null}
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Ajustes"
          onClick={() => {
            pushNotification({
              title: 'Ajustes abertos',
              description: 'Você foi direcionado para configurações.',
              tone: 'neutral',
              channel: 'site',
            });
            navigate('/configuracoes');
          }}
        >
          ⚙️
        </button>
        <button type="button" className="user-chip user-chip-button" onClick={onOpenProfile}>
          <span>{userInitials}</span>
          <div>
            <strong>{fullName}</strong>
            <small>{role}</small>
          </div>
          <span className="user-chip-chevron">▾</span>
        </button>
      </div>
    </div>
  );
}
