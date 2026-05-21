import { Avatar, Divider, ListItemIcon, Menu, MenuItem as MuiMenuItem } from '@mui/material';

type ProfileMenuProps = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  fullName: string;
  email: string;
  userInitials: string;
};

export default function ProfileMenu({
  anchorEl,
  onClose,
  fullName,
  email,
  userInitials,
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
    </Menu>
  );
}