import type {
  CompanyContract,
  CompanyDocument,
  CompanyMeeting,
  CompanyProposal,
  CompanyReport,
  ProposalColumn,
} from '../types';

export const initialProposalColumns: ProposalColumn[] = [
  {
    title: 'Rascunhos',
    items: [
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
    ],
  },
  {
    title: 'Aguardando Aprovação',
    items: [
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
    ],
  },
  {
    title: 'Em Revisão (Recusados)',
    items: [
      { company: 'Jota Nunes Construtora', tag: 'Financeiro', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Financeiro', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Financeiro', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Financeiro', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Financeiro', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
    ],
  },
  {
    title: 'Aceitas (Contratos gerados)',
    items: [
      { company: 'Jota Nunes Construtora', tag: 'Valuation', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Valuation', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Valuation', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Valuation', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Valuation', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
    ],
  },
];

export const companyOverviewMetrics = [
  { label: 'Receita mensal', value: 'R$ 78.000' },
  { label: 'Contratos ativos', value: '04' },
  { label: 'Propostas abertas', value: '03' },
  { label: 'Pendências', value: '02' },
];

export const companyProposals: CompanyProposal[] = [
  { title: 'Expansão BPO', service: 'BPO Financeiro', amount: 'R$ 12.000', status: 'Em análise' },
  { title: 'Valuation 2026', service: 'Valuation', amount: 'R$ 18.500', status: 'Aguardando aprovação' },
  { title: 'Diagnóstico Fiscal', service: 'Consultoria', amount: 'R$ 7.800', status: 'Rascunho' },
];

export const companyContracts: CompanyContract[] = [
  { code: 'CTR-2026-001', service: 'BPO Financeiro', startDate: '03/01/2026', status: 'Ativo' },
  { code: 'CTR-2026-014', service: 'Valuation', startDate: '11/02/2026', status: 'Ativo' },
  { code: 'CTR-2025-104', service: 'Consultoria Estratégica', startDate: '15/10/2025', status: 'Renovação' },
];

export const companyDocuments: CompanyDocument[] = [
  { name: 'Contrato social consolidado', category: 'Jurídico', status: 'Válido' },
  { name: 'Balanço patrimonial 2025', category: 'Financeiro', status: 'Pendente revisão' },
  { name: 'Procuração digital', category: 'Operacional', status: 'Válido' },
];

export const companyMeetings: CompanyMeeting[] = [
  { topic: 'Kickoff mensal', date: '09/04/2026 - 09:00', channel: 'Sala 2' },
  { topic: 'Revisão de proposta', date: '12/04/2026 - 16:00', channel: 'Google Meet' },
  { topic: 'Alinhamento de contrato', date: '15/04/2026 - 11:00', channel: 'Sala 1' },
];

export const companyReports: CompanyReport[] = [
  { title: 'Relatório executivo', period: 'Março 2026', status: 'Disponível' },
  { title: 'Resumo de indicadores', period: 'Q1 2026', status: 'Disponível' },
  { title: 'Pendências operacionais', period: 'Abril 2026', status: 'Em preparação' },
];