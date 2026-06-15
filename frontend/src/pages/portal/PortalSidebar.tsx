import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from '../../components/nav-link';
import logo from '../../assets/climbe_logo.svg';
import { CalendarCheck, FileInput, Folder, LogOut } from 'lucide-react';
import { clearPortalSession } from '../../services/portal';
import LogoutConfirmModal from '../../components/modals/logout-confirm-modal';

export default function PortalSidebar() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function handleConfirmLogout() {
    setShowLogoutConfirm(false);
    clearPortalSession();
    navigate('/portal/login');
  }

  return (
    <aside className="h-screen max-h-screen top-0 flex flex-col py-6 border-r border-zinc-700 w-full">
      <div className="flex items-center justify-between px-3 border-b border-zinc-700 pb-3">
        <img src={logo} alt="Climbe Investimentos" className="w-26 h-10" />
      </div>

      <div className="flex flex-col px-3 border-b border-zinc-700 py-3 space-y-3">
        <h3 className="text-sm font-medium text-zinc-400 uppercase">Portal do Cliente</h3>
        <div className="space-y-3">
          <NavLink to="/portal/propostas">
            <FileInput className="size-4 stroke-1 text-zinc-50" />
            Propostas
          </NavLink>
          <NavLink to="/portal/reunioes">
            <CalendarCheck className="size-4 stroke-1 text-zinc-50" />
            Reuniões
          </NavLink>
          <NavLink to="/portal/documentos">
            <Folder className="size-4 stroke-1 text-zinc-50" />
            Documentos
          </NavLink>
        </div>
      </div>

      <div className="h-full flex flex-col justify-end px-3 py-3 space-y-3">
        <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-3 px-3 py-1.5 text-sm font-medium text-zinc-50 transition-all cursor-pointer">
          <LogOut className="size-4 stroke-1 text-zinc-50" />
          Sair
        </button>
        <LogoutConfirmModal open={showLogoutConfirm} onConfirm={handleConfirmLogout} onCancel={() => setShowLogoutConfirm(false)} />
      </div>
    </aside>
  );
}
