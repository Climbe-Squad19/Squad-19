import { useEffect, useState } from 'react';
import { fetchPropostas, type PropostaApiResponse } from '../services/business';
import { initialProposalColumns } from '../mocks/business.mock';
import type { ProposalCardItem, ProposalColumn } from '../types';

export function useProposals() {
  const [proposalBoard, setProposalBoard] = useState<ProposalColumn[]>(initialProposalColumns);

  const statusToProposalStage = (status: string) => {
    const normalized = status.toUpperCase();
    if (normalized === 'ELABORACAO') {
      return 'Rascunhos';
    }
    if (normalized === 'ENVIADA') {
      return 'Aguardando Aprovação';
    }
    if (normalized === 'RECUSADA') {
      return 'Em Revisão (Recusados)';
    }
    if (normalized === 'ACEITA') {
      return 'Aceitas (Contratos gerados)';
    }
    return 'Rascunhos';
  };

  const serviceTagFromText = (value: string): ProposalCardItem['tag'] => {
    const text = value.toLowerCase();
    if (text.includes('valuation')) {
      return 'Valuation';
    }
    if (text.includes('finance')) {
      return 'Financeiro';
    }
    return 'BPO';
  };

  const buildProposalColumns = (propostas: PropostaApiResponse[]): ProposalColumn[] => {
    const stages = ['Rascunhos', 'Aguardando Aprovação', 'Em Revisão (Recusados)', 'Aceitas (Contratos gerados)'];
    return stages.map((stage) => ({
      title: stage,
      items: propostas
        .filter((proposta) => statusToProposalStage(proposta.status) === stage)
        .map((proposta) => ({
          company: proposta.nomeEmpresa,
          tag: serviceTagFromText(proposta.servicoContratado || ''),
          amount: `R$ ${Number(proposta.valorMensal || 0).toLocaleString('pt-BR')}`,
          createdLabel: proposta.dataCriacao
            ? `criada em ${new Date(proposta.dataCriacao).toLocaleDateString('pt-BR')}`
            : 'criada recentemente',
        })),
    }));
  };

  useEffect(() => {
    fetchPropostas()
      .then((propostas) => {
        setProposalBoard(buildProposalColumns(propostas));
      })
      .catch((error) => {
        console.error('Erro ao carregar propostas', error);
      });
  }, []);

  return { proposalBoard, setProposalBoard };
}
