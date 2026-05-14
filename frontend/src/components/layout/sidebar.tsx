import { NavLink } from 'react-router-dom';
import logo from '../../assets/climbe_logo.svg'

type SidebarProps = {
  search: string;
  onSearch: (value: string) => void;
  cadastrosPendentesCount: number;
  podeGerenciarCadastros: boolean;
  onLogout: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

const primaryItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Agenda', to: '/agenda' },
  { label: 'Propostas comerciais', to: '/propostas' },
  { label: 'Clientes / Empresas', to: '/empresas' },
];

const secondaryItems = [{ label: 'Equipe', to: '/equipe' }];

export default function Sidebar({
  search,
  onSearch,
  cadastrosPendentesCount,
  podeGerenciarCadastros,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar-brand">
        <img src={logo} alt="Climbe Investimentos" className="w-26 h-10" />
      </div>

      <div className="sidebar-search">
        <input type="search" placeholder="Pesquisar..." value={search} onChange={(event) => onSearch(event.target.value)} />
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Menu Principal</div>
        <nav className="sidebar-nav">
          {primaryItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onCloseMobile}
            >
              <span className="sidebar-link-indicator" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Gestão</div>
        <nav className="sidebar-nav">
          {secondaryItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onCloseMobile}
            >
              <span className="sidebar-link-indicator" />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {item.label}
                {item.label === 'Equipe' && podeGerenciarCadastros && cadastrosPendentesCount > 0 ? (
                  <span
                    style={{
                      minWidth: 22,
                      height: 22,
                      padding: '0 6px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: '22px',
                      textAlign: 'center',
                      background: '#42bee8',
                      color: '#04121f',
                    }}
                  >
                    {cadastrosPendentesCount}
                  </span>
                ) : null}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-section-title">Conta</div>
        <nav className="sidebar-nav">
          <NavLink to="/configuracoes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <span className="sidebar-link-indicator" />
            Configurações
          </NavLink>
          <button type="button" className="sidebar-link sidebar-link--secondary" onClick={onLogout}>
            <span className="sidebar-link-indicator" />
            Sair
          </button>
        </nav>
      </div>
    </aside>
  );
}