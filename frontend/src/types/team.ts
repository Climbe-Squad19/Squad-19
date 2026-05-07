export type TeamMember = {
  id?: number;
  name: string;
  role: string;
  status: 'Online' | 'Em reunião' | 'Offline';
  email: string;
  phone: string;
  cpf: string;
  permissions: string[];
};

export type TeamFocus = {
  title: string;
  detail: string;
};
