import logo from '../../assets/climbe_logo.svg'
import { Bell, Bolt, Building, CalendarCheck, FileInput, LayoutDashboard, LogOut, UsersRound } from 'lucide-react'
import { NavLink } from '../nav-link';
import { useState } from 'react';
import LogoutConfirmModal from '../modals/logout-confirm-modal';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN_KEY } from '../../services/api';

const primaryItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Agenda', to: '/agenda', icon: CalendarCheck },
  { label: 'Propostas comerciais', to: '/propostas', icon: FileInput },
  { label: 'Clientes / Empresas', to: '/empresas', icon: Building },
];

export default function Sidebar() {
  const navigate = useNavigate()

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function handleConfirmLogout() {
      setShowLogoutConfirm(false);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      navigate('/login');
    }
    
  return (
    <aside className='h-screen max-h-screen top-0 flex flex-col py-6 border-r border-zinc-700 w-full'>
      <div className="flex items-center justify-between px-3 border-b border-zinc-700 pb-3">
        <img src={logo} alt="Climbe Investimentos" className="w-26 h-10" />
        <button className='cursor-pointer'>
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
    </aside>
  );
}