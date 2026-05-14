export type MenuItem = {
  label: string;
  isLogout?: boolean;
};

export const primaryMenuItems: MenuItem[] = [
  { label: 'Dashboard' },
  { label: 'Agenda' },
  { label: 'Propostas comerciais' },
  { label: 'Clientes / Empresas' },
];

export const secondaryMenuItems: MenuItem[] = [{ label: 'Equipe' }];

export const accountItems: MenuItem[] = [
  { label: 'Configurações' },
  { label: 'Sair', isLogout: true },
];