import logo from '../../assets/climbe_logo.svg'
import { Bell, Bolt, Building, CalendarCheck, FileInput, LayoutDashboard, LogOut, UsersRound } from 'lucide-react'
import { NavLink } from '../nav-link';
import { useMemo, useState, MouseEvent } from 'react';
import LogoutConfirmModal from '../modals/logout-confirm-modal';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN_KEY } from '../../services/api';
import NotificationMenu from '../notifications/notification-menu';
import { useNotifications } from '../../hooks/use-notifications';
import { ProposalColumn } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { closeNotifications } from '../../store/uiSlice';

const primaryItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Agenda', to: '/agenda', icon: CalendarCheck },
  { label: 'Propostas comerciais', to: '/propostas', icon: FileInput },
  { label: 'Clientes / Empresas', to: '/empresas', icon: Building },
];

export default function Sidebar({ isLightMode = false }: { isLightMode?: boolean }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const notificationsOpen = Boolean(anchorEl);

  const emptyProposalColumns = useMemo<ProposalColumn[]>(() => [], []);
  const { notificationMessage, showNotifications } = useAppSelector((state) => state.ui);

  function handleConfirmLogout() {
    setShowLogoutConfirm(false);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    navigate('/login');
  }

  const { notificationItems } = useNotifications({
    filteredAgendaItemsCount: 0,
    filteredUpcomingItemsCount: 0,
    filteredProposalColumns: emptyProposalColumns,
    notificationMessage,
    showNotifications,
  });

  return (
    <aside className='h-screen max-h-screen top-0 flex flex-col py-6 border-r border-zinc-700 w-full'>
      <div className="flex items-center justify-between px-3 border-b border-zinc-700 pb-3">
        <img src={logo} alt="Climbe Investimentos" className="w-26 h-10" />
        <button 
          className='cursor-pointer' 
          onClick={(e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)}
        >
          <Bell className='stroke-1 text-zinc-50' />
        </button>
      </div>

      <div className="flex flex-col px-3 border-b border-zinc-700 py-3 space-y-3">
        <h3 className="text-sm font-medium text-zinc-400 uppercase">Menu Principal</h3>

        <div className="space-y-3">
          {primaryItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
            >
              <item.icon className="size-4 stroke-1 text-zinc-50" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex flex-col px-3 border-b border-zinc-700 py-3 space-y-3">
        <h3 className="text-sm font-medium text-zinc-400 uppercase">Gestão</h3>
        <div className="space-y-3">
          <NavLink
            to={'/equipe'}
          >
            <UsersRound className='size-4 stroke-1 text-zinc-50' />
            Equipe
          </NavLink>
        </div>
      </div>

      <div className="h-full flex flex-col justify-end px-3 py-3 space-y-3">
        <h3 className="text-sm text-zinc-400">Conta</h3>
        <div className="space-y-3">
          <NavLink to="/configuracoes">
            <Bolt className='size-4 stroke-1 text-zinc-50' />
            Configurações
          </NavLink>

          <button onClick={() => setShowLogoutConfirm(true)} className='flex items-center gap-3 px-3 py-1.5 text-sm font-medium text-zinc-50 transition-all cursor-pointer'>
            <LogOut className="size-4 stroke-1 text-zinc-50" />
            Sair
          </button>

          <LogoutConfirmModal open={showLogoutConfirm} onConfirm={handleConfirmLogout} onCancel={() => setShowLogoutConfirm(false)} />
        </div>
      </div>

      <NotificationMenu
  anchorEl={anchorEl}
  open={notificationsOpen}
  items={notificationItems}
  isLightMode={isLightMode}
  onClose={() => {
    setAnchorEl(null);
    dispatch(closeNotifications());
  }}
  onAdjust={() => {
    setAnchorEl(null);
    navigate('/configuracoes');
  }}
/>
    </aside>
  );
}