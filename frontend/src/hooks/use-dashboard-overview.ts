import { useEffect, useState } from 'react';
import { fetchDashboardOverview } from '../services/dashboard';
import type { ContractItem, SummaryCard, UpcomingItem } from '../types';
import { defaultRecentContracts, defaultSummaryCards, defaultUpcomingItems } from '../mocks/dashboard.mock';
import { formatDueLabel, getPriorityByDueDate } from '../utils/date';

export function useDashboardOverview() {
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>(defaultSummaryCards);
  const [recentContracts, setRecentContracts] = useState<ContractItem[]>(defaultRecentContracts);
  const [upcomingItems, setUpcomingItems] = useState<UpcomingItem[]>(defaultUpcomingItems);

  useEffect(() => {
    async function loadOverview() {
      try {
        const overview = await fetchDashboardOverview();

        setSummaryCards([
          { title: 'Propostas Pendentes', value: `${overview.propostasPendentes} proposta(s)`, subtitle: 'aguardando ação' },
          { title: 'Contratos Ativos', value: `${overview.contratosAtivos} contrato(s)`, subtitle: 'status ativo' },
          { title: 'Documentos para Validação', value: `${overview.documentosPendentes} pendente(s)`, subtitle: 'aguardando validação' },
          { title: 'Reuniões da Semana', value: `${overview.reunioesSemana} reunião(ões)`, subtitle: 'nos próximos 7 dias' },
        ]);

        setRecentContracts(
          overview.ultimosContratos.map((item) => ({
            company: item.empresa,
            service: item.servico,
            start: new Date(item.dataCriacao).toLocaleString('pt-BR'),
          }))
        );

        setUpcomingItems(
          overview.proximosVencimentos.map((item) => ({
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