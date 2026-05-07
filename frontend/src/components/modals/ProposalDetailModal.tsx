import type { ProposalCardItem } from '../../types';

type ProposalDetailModalProps = {
  detail: (ProposalCardItem & { stage: string }) | null;
  onClose: () => void;
};

export default function ProposalDetailModal({ detail, onClose }: ProposalDetailModalProps) {
  if (!detail) {
    return null;
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section className="dialog-card" onClick={(event) => event.stopPropagation()}>
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
        </div>
        <div className="dialog-actions">
          <button type="button" className="button button--outline" onClick={onClose}>Fechar</button>
        </div>
      </section>
    </div>
  );
}
