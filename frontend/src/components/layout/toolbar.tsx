import { useState, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { NotificationFeedItem } from '../../types';
import { LayoutDashboard, CalendarCheck, FileInput, Building, UsersRound, Bolt } from 'lucide-react';
import { current } from '@reduxjs/toolkit';
import { useAppSelector } from '../../store/hooks';
import { getInitials } from '../../utils/get-initials-from-word';
import ProfileMenu from '../profile/profile-menu';

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
}: ToolbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = titleMap[location.pathname] ?? 'Dashboard';

  const pages = [
    { label: 'Dashboard /', to: '/dashboard', icon: LayoutDashboard, description: 'Visão geral' },
    { label: 'Agenda /', to: '/agenda', icon: CalendarCheck, description: 'Gerenciar eventos' },
    { label: 'Propostas comerciais /', to: '/propostas', icon: FileInput, description: 'Visão geral' },
    { label: 'Empresas /', to: '/empresas', icon: Building, description: 'Visão geral' },
    { label: 'Equipe /', to: '/equipe', icon: UsersRound, description: 'Visão geral' },
    { label: 'Configurações', to: '/configuracoes', icon: Bolt },
  ];

  const { pathname } = useLocation()

  const currentPage = pages.find(page => page.to === pathname) || pages[0]

  const profile = useAppSelector((state) => state.profile);

  const [profileMenuAnchor, setProfileMenuAnchor] = useState<HTMLElement | null>(null);

  function handleOpenProfileMenu(event: MouseEvent<HTMLButtonElement>) {
    setProfileMenuAnchor(event.currentTarget);
  }

  return (
    <div className="w-full px-6 py-5.5 flex items-center justify-between border-b border-zinc-700">
      <div className="flex items-center gap-3">
        {currentPage.icon && <currentPage.icon className='size-5 stroke-1 text-zinc-500' />}

        <div className='space-x-1'>
          <span className='text-base font-semibold text-zinc-50'>{currentPage.label}</span>
          <span className='text-base font-semibold text-zinc-500'>{currentPage.description}</span>
        </div>
      </div>

      <button onClick={handleOpenProfileMenu} className='bg-zinc-800 border border-zinc-600 rounded-md size-8 flex items-center justify-center'>
        <span className='text-sm font-semibold text-zinc100'>
          {getInitials(profile.fullName)}
        </span>
      </button>


      <ProfileMenu
        anchorEl={profileMenuAnchor}
        onClose={() => setProfileMenuAnchor(null)}
        fullName={profile.fullName}
        email={profile.email}
        userInitials={getInitials(profile.fullName)}
      />
    </div>
  );
}