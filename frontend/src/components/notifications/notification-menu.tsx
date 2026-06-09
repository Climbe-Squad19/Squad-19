import { Menu } from '@mui/material';
import type { NotificationFeedItem } from '../../types';

type NotificationMenuProps = {
  open: boolean;
  anchorEl: null | HTMLElement;
  items: NotificationFeedItem[];
  onClose: () => void;
  onAdjust: () => void;
  isLightMode?: boolean;
};

export default function NotificationMenu({ open, anchorEl, items, onClose, onAdjust, isLightMode }: NotificationMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: {
            ml: 1.0,
            width: 360,
            maxWidth: 'calc(100vw - 24px)',
            background: isLightMode ? '#ffffff' : '#1c1c1f',
            color: isLightMode ? '#0f172a' : '#edf2f7',
            maxHeight: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            border: isLightMode ? '1px solid rgba(15,23,42,0.1)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: 1,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.34)',
          },
        },
      }}
    >
      <div className="notification-menu-header" style={{ color: isLightMode ? '#0f172a' : '#edf2f7' }}>
  <div>
    <strong style={{ color: isLightMode ? '#0f172a' : '#edf2f7' }}>Notificações</strong>
    <small style={{ color: isLightMode ? '#475569' : '#9ab0d6' }}>Painel rápido da operação</small>
  </div>
        <button type="button" className="button button--text notification-menu-close" onClick={onClose}>
          Fechar
        </button>
      </div>

      <div className="notification-menu-list">
        {items.map((item) => (
          <article key={`${item.title}-${item.description}`} className={`notification-menu-item notification-menu-item--${item.tone}`}>
            <span className="notification-menu-pulse" />
            <div className="notification-menu-copy">
              <div className="notification-menu-meta">
                <span
  className={`notification-channel notification-channel--${item.channel}`}
  style={{
    background: isLightMode ? '#0f172a' : undefined,
    color: isLightMode ? '#ffffff' : undefined,
  }}
>
  {item.channel === 'site' ? 'Site' : item.channel === 'email' ? 'E-mail' : 'Agenda'}
</span>
                <small style={{ color: isLightMode ? '#475569' : '#9ab0d6' }}>{item.timeLabel}</small>
              </div>
              <strong style={{ color: isLightMode ? '#0f172a' : '#edf2f7' }}>{item.title}</strong>
              <small style={{ color: isLightMode ? '#475569' : '#9ab0d6' }}>{item.description}</small>
            </div>
          </article>
        ))}
      </div>

      <div className="notification-menu-footer">
  <button
    type="button"
    className="button button--outline"
    onClick={onAdjust}
    style={{
      color: isLightMode ? '#0f172a' : '#edf2f7',
      borderColor: isLightMode ? '#0f172a' : 'rgba(255,255,255,0.2)',
    }}
  >
    Ajustar notificações
  </button>
</div>
    </Menu>
  );
}