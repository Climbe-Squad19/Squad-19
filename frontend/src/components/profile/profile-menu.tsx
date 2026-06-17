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
            background: '#1c1c1f',
            color: '#edf2f7',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 1,
          },
        },
      }}
    >
      <MuiMenuItem disabled>
        <div className="profile-menu-header">
          <strong>{fullName}</strong>
          <small>{email}</small>
        </div>
      </MuiMenuItem>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      
      <MuiMenuItem onClick={onOpenProfile}>
        <ListItemIcon>
          <Avatar sx={{ width: 24, height: 24, bgcolor: '#79C6C0', color: '#04121f', fontSize: 12 }}>
            {userInitials}
          </Avatar>
        </ListItemIcon>
        Perfil
      </MuiMenuItem>
      
      <MuiMenuItem onClick={onSettings}>
        <ListItemIcon>
          <span className="profile-menu-icon">⚙️</span>
        </ListItemIcon>
        Configurações
      </MuiMenuItem>
    </Menu>
  );
}