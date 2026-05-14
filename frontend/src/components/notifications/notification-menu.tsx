import { Menu } from '@mui/material';
import type { NotificationFeedItem } from '../../types';

type NotificationMenuProps = {
  anchorEl: HTMLElement | null;
  items: NotificationFeedItem[];
  onClose: () => void;
  onAdjust: () => void;
};

export default function NotificationMenu({ anchorEl, items, onClose, onAdjust }: NotificationMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            mt: 1.25,
            width: 360,
            maxWidth: 'calc(100vw - 24px)',
            background: '#1c1c1f',
            color: '#edf2f7',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 1,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.34)',
          },
        },
      }}
    >
      <div className="notification-menu-header">
        <div>
          <strong>Notificações</strong>
          <small>Painel rápido da operação</small>
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
                <span className={`notification-channel notification-channel--${item.channel}`}>
                  {item.channel === 'site' ? 'Site' : item.channel === 'email' ? 'E-mail' : 'Agenda'}
                </span>
                <small>{item.timeLabel}</small>
              </div>
              <strong>{item.title}</strong>
              <small>{item.description}</small>
            </div>
          </article>
        ))}
      </div>
      <div className="notification-menu-footer">
        <button type="button" className="button button--outline" onClick={onAdjust}>
          Ajustar notificações
        </button>
      </div>
    </Menu>
  );
}