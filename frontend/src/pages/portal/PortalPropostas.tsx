import { Tooltip } from '@mui/material';
import { Eye, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ProposalDetailModal from '../../components/modals/proposal-detail-modal';
import { buildProposalColumns } from '../../hooks/use-proposals';
import { criarPortalProposta, fetchPortalPropostas, updatePortalPropostaStatus, getPortalEmpresaId } from '../../services/portal';
import type { ProposalCardItem } from '../../types';
import type { PropostaApiResponse } from '../../services/business';

const SERVICOS = [
  'Valuation',
  'BPO Financeiro',
  'CFO Sob Demanda',
  'Fusões & Aquisições (M&A)',
  'Contabilidade',
];

export default function PortalPropostasPage() {
  const [propostas, setPropostas] = useState<PropostaApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposalDetail, setSelectedProposalDetail] = useState<(ProposalCardItem & { stage: string }) | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formServico, setFormServico] = useState(SERVICOS[0]);
  const [formValorMensal, setFormValorMensal] = useState('');
  const [formValorSetup, setFormValorSetup] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const isValuationService = formServico === 'Valuation';

  const empresaId = getPortalEmpresaId();
  const proposalBoard = useMemo(() => buildProposalColumns(propostas), [propostas]);

  const reloadPropostas = async () => {
    if (!empresaId) return;
    const next = await fetchPortalPropostas(empresaId);
    setPropostas(next);
  };

  useEffect(() => {
    if (!empresaId) {
      setLoading(false);
      return;
    }

    reloadPropostas()
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Erro ao carregar propostas'))
      .finally(() => setLoading(false));
  }, [empresaId]);

  async function handleUpdateStatus(propostaId: number, status: 'ACEITA' | 'RECUSADA', motivo?: string) {
    try {
      await updatePortalPropostaStatus(propostaId, status, motivo);
      await reloadPropostas();
      toast.success(`Proposta ${status === 'ACEITA' ? 'aceita' : 'recusada'} com sucesso.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar status');
      throw error;
    }
  }

  async function handleCriarProposta() {
    if (!empresaId) return;
    if (!isValuationService && (!formValorMensal || Number.isNaN(Number(formValorMensal)))) {
      toast.error('Informe um valor mensal valido.');
      return;
    }

    setFormSubmitting(true);
    try {
      await criarPortalProposta(empresaId, {
        servicoContratado: formServico,
        valorMensal: isValuationService ? undefined : Number(formValorMensal),
        valorSetup: formValorSetup ? Number(formValorSetup) : undefined,
        linkGoogleDrive: formLink || undefined,
      });
      setShowForm(false);
      setFormServico(SERVICOS[0]);
      setFormValorMensal('');
      setFormValorSetup('');
      setFormLink('');
      await reloadPropostas();
      toast.success('Proposta enviada para a Climbe.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar proposta.');
    } finally {
      setFormSubmitting(false);
    }
  }

  return (
    <>
      {showForm ? (
        <div className="dialog-backdrop" onClick={() => setShowForm(false)}>
          <section className="dialog-card" onClick={(event) => event.stopPropagation()}>
            <div className="panel-header">
              <div>
                <h3>Nova proposta</h3>
                <span>Envie uma solicitação para a Climbe avaliar</span>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowForm(false)}>×</button>
            </div>

            <div className="agenda-form">
              <label>
                Serviço
                <select
                  value={formServico}
                  onChange={(event) => {
                    setFormServico(event.target.value);
                    if (event.target.value === 'Valuation') {
                      setFormValorMensal('');
                    }
                  }}
                >
                  {SERVICOS.map((servico) => (
                    <option key={servico} value={servico}>{servico}</option>
                  ))}
                </select>
              </label>
              {!isValuationService ? (
              <label>
                Valor mensal (R$)
                <input type="number" min="0" value={formValorMensal} onChange={(event) => setFormValorMensal(event.target.value)} />
              </label>
              ) : null}
              <label>
                Valor setup (R$)
                <input type="number" min="0" value={formValorSetup} onChange={(event) => setFormValorSetup(event.target.value)} />
              </label>
              <label>
                Link Google Drive
                <input type="text" value={formLink} onChange={(event) => setFormLink(event.target.value)} />
              </label>
            </div>

            <div className="dialog-actions">
              <button type="button" className="button button--outline" onClick={() => setShowForm(false)}>Fechar</button>
              <button type="button" className="button button--primary" disabled={formSubmitting} onClick={() => void handleCriarProposta()}>
                {formSubmitting ? 'Enviando...' : 'Enviar proposta'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <section className="panel stacked-panel">
        <div className="section-topbar">
          <div>
            <h3>Propostas</h3>
            <span>Envie propostas e responda as propostas recebidas</span>
          </div>
          <div className="section-actions">
            <button type="button" className="button button--primary section-create-button" onClick={() => setShowForm(true)}>
              <Plus className="size-4" />
              Nova proposta
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-zinc-400">Carregando propostas...</div>
        ) : propostas.length === 0 ? (
          <div className="p-6 text-zinc-400 text-center">Nenhuma proposta encontrada para esta empresa.</div>
        ) : (
          <div className="proposal-board">
            {proposalBoard.map((column) => (
              <section key={column.title} className="proposal-column">
                <div className="proposal-column-header">{column.title}</div>
                <div className="proposal-column-list">
                  {column.items.map((item) => {
                    const statusClass = item.status === 'ACEITA'
                      ? 'portal-proposal-card--accepted'
                      : item.status === 'RECUSADA'
                        ? 'portal-proposal-card--rejected'
                        : '';

                    return (
                      <article key={`${column.title}-${item.id}`} className={`proposal-card portal-proposal-card ${statusClass}`}>
                        <div className="proposal-card-top">
                          <strong>{item.company}</strong>
                          {item.amount ? <small>{item.amount}</small> : null}
                        </div>
                        <div className="proposal-card-middle">
                          <span className={`proposal-chip proposal-chip--${item.tag.toLowerCase()}`}>{item.tag}</span>
                        </div>
                        <div className="proposal-card-bottom">
                          <span className="proposal-card-avatar">C</span>
                          <small>{item.createdLabel}</small>
                        </div>
                        <Tooltip title="Ver detalhes" arrow>
                          <button
                            type="button"
                            className="icon-button detail-icon-button"
                            onClick={() => setSelectedProposalDetail({ ...item, stage: column.title })}
                          >
                            <Eye className="size-4" />
                          </button>
                        </Tooltip>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <ProposalDetailModal
        detail={selectedProposalDetail}
        onClose={() => setSelectedProposalDetail(null)}
        onApprove={(id) => handleUpdateStatus(id, 'ACEITA')}
        onReject={(id, motivo) => handleUpdateStatus(id, 'RECUSADA', motivo)}
      />
    </>
  );
}

