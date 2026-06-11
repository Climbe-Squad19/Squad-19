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
};

export default function ProposalDetailModal({ detail, onClose, onApprove, onReject, onEnviar }: ProposalDetailModalProps) {
  const [selectedMotivo, setSelectedMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (!detail) return null;

  const isRascunho = detail.stage === 'Rascunhos';
  const isAguardando = detail.stage === 'Aguardando Aprovação';

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
          <article className="team-member-meta-item">
            <span>Valor</span>
            <strong>{detail.amount}</strong>
          </article>
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

        {isAguardando && (
          <div style={{ marginTop: 16 }}>
            <span style={{ fontSize: 13, opacity: 0.7 }}>Motivo da recusa (obrigatório para recusar)</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {MOTIVOS_RECUSA.map((motivo) => (
                <button
                  key={motivo}
                  type="button"
                  onClick={() => setSelectedMotivo(motivo)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: `1px solid ${selectedMotivo === motivo ? '#79C6C0' : 'rgba(255,255,255,0.08)'}`,
                    background: selectedMotivo === motivo ? 'rgba(121,198,192,0.12)' : 'rgba(255,255,255,0.03)',
                    color: selectedMotivo === motivo ? '#79C6C0' : '#edf2f7',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
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

        <div className="dialog-actions" style={{ marginTop: 16 }}>
          {isRascunho && (
            <button type="button" className="button button--outline" onClick={handleEnviar} disabled={loading}>
              Enviar para aprovação
            </button>
          )}
          {isAguardando && (
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