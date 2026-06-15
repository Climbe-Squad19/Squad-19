import { useLocation } from 'react-router-dom';

type PortalToolbarProps = {
  isLightSurfaceMode: boolean;
  onToggleSurfaceMode: () => void;
  onToggleSidebar: () => void;
  mobileSidebarOpen: boolean;
};

const titleMap: Record<string, { label: string; description: string }> = {
  '/portal/propostas': { label: 'Propostas', description: 'Acompanhe suas propostas' },
  '/portal/reunioes': { label: 'Reuniões', description: 'Veja suas próximas reuniões' },
  '/portal/documentos': { label: 'Documentos', description: 'Envie e acompanhe documentos' },
};

export default function PortalToolbar({ isLightSurfaceMode, onToggleSurfaceMode }: PortalToolbarProps) {
  const location = useLocation();
  const page = titleMap[location.pathname] ?? { label: 'Portal', description: 'Área de clientes' };

  return (
    <div className="w-full px-6 py-5.5 flex items-center justify-between border-b border-zinc-700">
      <div className="flex flex-col gap-1">
        <span className="text-base font-semibold text-zinc-50">{page.label}</span>
        <span className="text-sm text-zinc-500">{page.description}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSurfaceMode}
          className={`theme-toggle-button button ${isLightSurfaceMode ? 'theme-toggle-button--light' : 'theme-toggle-button--dark'}`}
          title="Alternar tema"
          aria-label="Alternar tema"
        >
          {isLightSurfaceMode ? 'Claro' : 'Escuro'}
        </button>
      </div>
    </div>
  );
}
