import { useEffect, useState } from 'react';
import { fetchPropostas, atualizarStatusProposta, type PropostaApiResponse } from '../services/business';
import { initialProposalColumns } from '../mocks/business.mock';
import type { ProposalCardItem, ProposalColumn } from '../types';

export const proposalStages = [
  'Rascunhos',
  'Aguardando Aprovação',
  'Em Revisão (Recusados)',
  'Aceitas (Contratos gerados)',
];

export const statusToProposalStage = (status: string) => {
  const normalized = status.toUpperCase();
  if (normalized === 'ELABORACAO') return 'Rascunhos';
  if (normalized === 'ENVIADA') return 'Aguardando Aprovação';
  if (normalized === 'RECUSADA') return 'Em Revisão (Recusados)';
  if (normalized === 'ACEITA') return 'Aceitas (Contratos gerados)';
  return 'Rascunhos';
};

export const serviceTagFromText = (value: string): ProposalCardItem['tag'] => {
  const text = value.toLowerCase();
  if (text.includes('valuation')) return 'Valuation';
  if (text.includes('finance')) return 'Financeiro';
  return 'BPO';
};

export const buildProposalColumns = (propostas: PropostaApiResponse[]): ProposalColumn[] =>
  proposalStages.map((stage) => ({
    title: stage,
    items: propostas
      .filter((proposta) => statusToProposalStage(proposta.status) === stage)
      .map((proposta) => {
        const tag = serviceTagFromText(proposta.servicoContratado || '');
        return {
          id: proposta.id,
          company: proposta.nomeEmpresa,
          tag,
          amount: tag === 'Valuation' ? '' : `R$ ${Number(proposta.valorMensal || 0).toLocaleString('pt-BR')}`,
          createdLabel: proposta.dataCriacao
            ? `criada em ${new Date(proposta.dataCriacao).toLocaleDateString('pt-BR')}`
            : 'criada recentemente',
          rejectionReason: proposta.motivoRecusa ?? proposta.motivoDaRecusa ?? proposta.justificativaRecusa ?? undefined,
          linkGoogleDrive: proposta.linkGoogleDrive ?? undefined,
          status: proposta.status,
          createdByClimbe: Boolean(proposta.criadoPorId),
        };
      }),
  }));

export function useProposals() {
  const [proposalBoard, setProposalBoard] = useState<ProposalColumn[]>(initialProposalColumns);

  const reloadProposals = () => {
    fetchPropostas()
      .then((propostas) => setProposalBoard(buildProposalColumns(propostas)))
      .catch((error) => console.error('Erro ao carregar propostas', error));
  };

  const aprovarProposta = async (proposalId: number) => {
    await atualizarStatusProposta(proposalId, 'ACEITA');
    reloadProposals();
  };

  const recusarProposta = async (proposalId: number, motivo: string) => {
    await atualizarStatusProposta(proposalId, 'RECUSADA', motivo);
    reloadProposals();
  };

  const enviarParaAprovacao = async (proposalId: number) => {
    await atualizarStatusProposta(proposalId, 'ENVIADA');
    reloadProposals();
  };

  useEffect(() => {
    reloadProposals();
  }, []);

  return { proposalBoard, setProposalBoard, aprovarProposta, recusarProposta, reloadProposals, enviarParaAprovacao };
}
