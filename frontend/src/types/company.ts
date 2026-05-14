export type ClientCompany = {
  id?: number;
  name: string;
  document: string;
  status: string;
  statusSince: string;
  tags: string[];
};

export type CompanyDetailTab =
  | 'Visão geral'
  | 'Propostas'
  | 'Contratos'
  | 'Documentos'
  | 'Reuniões'
  | 'Relatórios';

export type CompanyProposal = {
  title: string;
  service: string;
  amount: string;
  status: string;
};

export type CompanyContract = {
  code: string;
  service: string;
  startDate: string;
  status: string;
};

export type CompanyDocument = {
  name: string;
  category: string;
  status: string;
};

export type CompanyMeeting = {
  topic: string;
  date: string;
  channel: string;
};

export type CompanyReport = {
  title: string;
  period: string;
  status: string;
};