import { useEffect, useState } from 'react';
import { fetchDashboardOverview } from '../services/dashboard';
import { fetchContratos, type ContratoApiResponse } from '../services/business';
import type { ContractItem, SummaryCard, UpcomingItem } from '../types';
import { defaultRecentContracts, defaultSummaryCards, defaultUpcomingItems } from '../mocks/dashboard.mock';
import { formatDueLabel, getPriorityByDueDate } from '../utils/date';

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function resolveContractId(
  contracts: ContratoApiResponse[],
  companyName: string,
  serviceName: string
) {
  const normalizedCompany = normalizeText(companyName);
  const normalizedService = normalizeText(serviceName);

  return contracts.find((contract) => {
    const sameCompany = normalizeText(contract.nomeEmpresa) === normalizedCompany;
    const sameService = normalizeText(contract.tipoServico) === normalizedService;
    return sameCompany && sameService;
  })?.id;
}

export function useDashboardOverview() {
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>(defaultSummaryCards);
  const [recentContracts, setRecentContracts] = useState<ContractItem[]>(defaultRecentContracts);
  const [upcomingItems, setUpcomingItems] = useState<UpcomingItem[]>(defaultUpcomingItems);

  useEffect(() => {
    async function loadOverview() {
      try {
        const [overview, contracts] = await Promise.all([fetchDashboardOverview(), fetchContratos()]);

        setSummaryCards([
          { title: 'Propostas Pendentes', value: `${overview.propostasPendentes} proposta(s)`, subtitle: 'aguardando ação' },
          { title: 'Contratos Ativos', value: `${overview.contratosAtivos} contrato(s)`, subtitle: 'status ativo' },
          { title: 'Documentos para Validação', value: `${overview.documentosPendentes} pendente(s)`, subtitle: 'aguardando validação' },
          { title: 'Reuniões da Semana', value: `${overview.reunioesSemana} reunião(ões)`, subtitle: 'nos próximos 7 dias' },
        ]);

        setRecentContracts(
          overview.ultimosContratos.map((item) => ({
            contractId: item.id,
            company: item.empresa,
            service: item.servico,
            start: new Date(item.dataCriacao).toLocaleString('pt-BR'),
          }))
        );

        setUpcomingItems(
          overview.proximosVencimentos.map((item) => ({
            contractId: resolveContractId(contracts, item.empresa, item.referencia),
            client: item.empresa,
            reference: item.referencia,
            due: formatDueLabel(item.dataVencimento),
            priority: getPriorityByDueDate(item.dataVencimento),
          }))
        );
      } catch (error) {
        console.error('Erro ao carregar visão geral do dashboard', error);
      }
    }

    void loadOverview();
  }, []);

  return { summaryCards, recentContracts, upcomingItems };
}
