import { Avatar, Divider, ListItemIcon, Menu, MenuItem as MuiMenuItem } from '@mui/material';

type ProfileMenuProps = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  fullName: string;
  email: string;
  userInitials: string;
  onOpenProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  isLightMode?: boolean;
};

export default function ProfileMenu({
  anchorEl,
  onClose,
  fullName,
  email,
  userInitials,
  onOpenProfile,
  onSettings,
  onLogout,
  isLightMode,
}: ProfileMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            minWidth: 240,
            background: isLightMode ? '#ffffff' : '#1c1c1f',
            color: isLightMode ? '#0f172a' : '#edf2f7',
            border: isLightMode ? '1px solid rgba(15,23,42,0.1)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: 1,
          },
        },
      }}
    >
      <MuiMenuItem disabled>
        <div className="profile-menu-header">
          <strong style={{ color: isLightMode ? '#0f172a' : '#edf2f7' }}>{fullName}</strong>
          <small style={{ color: isLightMode ? '#64748b' : '#9ab0d6' }}>{email}</small>
        </div>
      </MuiMenuItem>

      <Divider sx={{ borderColor: isLightMode ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)' }} />

      <MuiMenuItem onClick={onOpenProfile} sx={{ color: isLightMode ? '#0f172a' : '#edf2f7', '&:hover': { background: isLightMode ? 'rgba(121,198,192,0.1)' : 'rgba(255,255,255,0.05)' } }}>
        <ListItemIcon>
          <Avatar sx={{ width: 24, height: 24, bgcolor: '#79C6C0', color: '#04121f', fontSize: 12 }}>
            {userInitials}
          </Avatar>
        </ListItemIcon>
        Perfil
      </MuiMenuItem>

      <MuiMenuItem onClick={onSettings} sx={{ color: isLightMode ? '#0f172a' : '#edf2f7', '&:hover': { background: isLightMode ? 'rgba(121,198,192,0.1)' : 'rgba(255,255,255,0.05)' } }}>
        <ListItemIcon>
          <span className="profile-menu-icon">⚙️</span>
        </ListItemIcon>
        Configurações
      </MuiMenuItem>
    </Menu>
  );
}