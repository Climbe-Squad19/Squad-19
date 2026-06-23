export type ProposalCardItem = {
  id?: number;
  company: string;
  tag: 'BPO' | 'Financeiro' | 'Valuation';
  amount: string;
  createdLabel: string;
  rejectionReason?: string;
  linkGoogleDrive?: string;
  status?: string;
  createdByClimbe?: boolean;
  criadoPorId?: number | null;
  nomeCriadoPor?: string | null;
};

export type ProposalColumn = {
  title: string;
  items: ProposalCardItem[];
};

export type ContractItem = {
  contractId?: number;
  company: string;
  service: string;
  start: string;
};

export type UpcomingItem = {
  contractId?: number;
  client: string;
  reference: string;
  due: string;
  priority: 'Alta' | 'Média' | 'Baixa';
};
