import { useState } from 'react';
import type { ProposalCardItem } from '../../types';

const MOTIVOS_RECUSA = [
  'Proposta fora do escopo dos serviços oferecidos pela Climbe.',
  'Valores e condições comerciais não estão alinhados com o contrato.',
  'Documentação da empresa contratante está incompleta ou irregular.',
  'Proposta duplicada ou já existe contrato ativo para este serviço.',
  'Empresa não atende aos critérios de elegibilidade da Climbe.',
];

type ProposalDetailModalProps = {
  detail: (ProposalCardItem & { stage: string }) | null;
  onClose: () => void;
  onApprove?: (id: number) => Promise<void>;
  onReject?: (id: number, motivo: string) => Promise<void>;
  onEnviar?: (id: number) => Promise<void>;
  /** 'CLIMBE' (padrão): funcionário responde propostas criadas pela empresa.
   *  'EMPRESA': empresa responde propostas criadas pela Climbe. */
  respondente?: 'CLIMBE' | 'EMPRESA';
};

export default function ProposalDetailModal({ detail, onClose, onApprove, onReject, onEnviar, respondente = 'CLIMBE' }: ProposalDetailModalProps) {
  const [selectedMotivo, setSelectedMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const getStageFeedback = () => {
    if (!detail) return '';
    if (detail.stage === 'Aguardando Aprovação') return 'Esta proposta está aguardando uma resposta.';
    if (detail.stage === 'Aceitas (Contratos gerados)') return 'Esta proposta foi aceita.';
    if (detail.stage === 'Em Revisão (Recusados)') return 'Esta proposta foi recusada.';
    return '';
  };

  const [feedback, setFeedback] = useState(getStageFeedback);

  if (!detail) return null;

  const isRascunho = detail.stage === 'Rascunhos' && respondente === 'CLIMBE';
  // Climbe responde quando empresa criou (criadoPorId == null)
  // Empresa responde quando Climbe criou (criadoPorId != null)
  const isAguardando = detail.stage === 'Aguardando Aprovação' && (
    respondente === 'CLIMBE' ? !detail.criadoPorId : !!detail.criadoPorId
  );

  const canEnviar = isRascunho && Boolean(onEnviar);
  const canResponder = isAguardando && Boolean(onApprove && onReject);

  const handleApprove = async () => {
    if (!detail.id || !onApprove) return;
    setLoading(true);
    try {
      await onApprove(detail.id);
      setFeedback('Proposta aprovada com sucesso!');
      setTimeout(onClose, 1200);
    } catch {
      setFeedback('Erro ao aprovar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!detail.id || !onReject) return;
    if (!selectedMotivo) {
      setFeedback('Selecione um motivo de recusa.');
      return;
    }
    setLoading(true);
    try {
      await onReject(detail.id, selectedMotivo);
      setFeedback('Proposta recusada.');
      setTimeout(onClose, 1200);
    } catch {
      setFeedback('Erro ao recusar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviar = async () => {
    if (!detail.id || !onEnviar) return;
    setLoading(true);
    try {
      await onEnviar(detail.id);
      setFeedback('Proposta enviada para aprovação!');
      setTimeout(onClose, 1200);
    } catch {
      setFeedback('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section className="dialog-card" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <div>
            <h3>{detail.company}</h3>
            <span>Etapa: {detail.stage}</span>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>✕</button>
        </div>

        <div className="team-detail-grid">
          <article className="team-member-meta-item">
            <span>Serviço</span>
            <strong>{detail.tag}</strong>
          </article>
          {detail.amount ? (
            <article className="team-member-meta-item">
              <span>Valor</span>
              <strong>{detail.amount}</strong>
            </article>
          ) : null}
          <article className="team-member-meta-item team-member-meta-item--full">
            <span>Histórico</span>
            <strong>{detail.createdLabel}</strong>
          </article>
          {detail.rejectionReason && (
            <article className="team-member-meta-item team-member-meta-item--full">
              <span>Motivo da recusa</span>
              <strong>{detail.rejectionReason}</strong>
            </article>
          )}
        </div>

        {detail.linkGoogleDrive && (
          <button
            type="button"
            className="button button--outline"
            style={{ marginTop: 12, width: '100%' }}
            onClick={() => window.open(detail.linkGoogleDrive!, '_blank')}
          >
            Analisar proposta
          </button>
        )}

        {canResponder && (
          <div style={{ marginTop: 16 }}>
            <span style={{ fontSize: 13, opacity: 0.7 }}>Motivo da recusa (obrigatório para recusar)</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {MOTIVOS_RECUSA.map((motivo) => (
                <button
  key={motivo}
  type="button"
  className={selectedMotivo === motivo ? 'proposal-rejection-option proposal-rejection-option--selected' : 'proposal-rejection-option'}
  onClick={() => setSelectedMotivo(motivo)}
  style={{
    textAlign: 'left',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    width: '100%',
  }}
>
                  {motivo}
                </button>
              ))}
            </div>
          </div>
        )}

        {feedback && (
          <p style={{ marginTop: 12, fontSize: 13, color: '#79C6C0' }}>{feedback}</p>
        )}

        {detail.stage === 'Aguardando Aprovação' && !isAguardando && (
          <p style={{ marginTop: 12, fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
            {respondente === 'CLIMBE'
              ? 'Aguardando resposta da empresa.'
              : 'Aguardando resposta da Climbe.'}
          </p>
        )}

        <div className="dialog-actions" style={{ marginTop: 16 }}>
          {canEnviar && (
            <button type="button" className="button button--outline" onClick={handleEnviar} disabled={loading}>
              Enviar para empresa
            </button>
          )}
          {canResponder && (
            <>
              <button type="button" className="button button--outline" onClick={handleReject} disabled={loading}>
                Recusar
              </button>
              <button type="button" className="button button--primary" onClick={handleApprove} disabled={loading}>
                Aprovar
              </button>
            </>
          )}
          <button type="button" className="button button--outline" onClick={onClose}>Fechar</button>
        </div>
      </section>
    </div>
  );
}
