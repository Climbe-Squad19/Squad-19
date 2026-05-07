import type { ContractItem, SummaryCard, UpcomingItem } from '../types';

export const defaultSummaryCards: SummaryCard[] = [
  { title: 'Propostas Pendentes', value: '3 propostas', subtitle: 'nos últimos 30 dias' },
  { title: 'Contratos Ativos', value: '10 contratos', subtitle: 'no último 30 dias' },
  { title: 'Documentos para Validação', value: '5 restantes', subtitle: 'de 3 empresas diferentes' },
  { title: 'Reuniões da Semana', value: '13 reuniões', subtitle: 'nos próximos 5 dias' },
];

export const defaultRecentContracts: ContractItem[] = [
  { company: 'Universidade Tiradentes', service: 'BPO Financeiro', start: '08/03/2026 - 08:32h' },
  { company: 'JotaNunes Construtora', service: 'Análise Valuation', start: '05/03/2026 - 14:59h' },
  { company: 'Porto Digital', service: 'M&A', start: '23/02/2026 - 17:00h' },
];

export const defaultUpcomingItems: UpcomingItem[] = [
  { client: 'Empresa X', reference: 'Entrega de balanço', due: 'em 3 dias', priority: 'Média' },
  { client: 'Unit', reference: 'Renovação de contrato', due: 'em 2 semanas', priority: 'Alta' },
  { client: 'Empresa Y', reference: 'Relatório', due: 'em 3 dias', priority: 'Baixa' },
];
