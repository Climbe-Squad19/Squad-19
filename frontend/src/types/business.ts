export type ProposalCardItem = {
  id?: number;
  company: string;
  tag: 'BPO' | 'Financeiro' | 'Valuation';
  amount: string;
  createdLabel: string;
  rejectionReason?: string;
  linkGoogleDrive?: string;
};

export type ProposalColumn = {
  title: string;
  items: ProposalCardItem[];
};

export type ContractItem = {
  company: string;
  service: string;
  start: string;
};

export type UpcomingItem = {
  client: string;
  reference: string;
  due: string;
  priority: 'Alta' | 'Média' | 'Baixa';
};