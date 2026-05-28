import type { EntityActionModal as EntityActionModalData } from '../../types';

type EntityActionModalProps = {
  modal: EntityActionModalData | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function EntityActionModal({ modal, onClose, onConfirm }: EntityActionModalProps) {
  if (!modal) {
    return null;
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section className="dialog-card dialog-card--compact" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <div>
            <h3>{modal.title}</h3>
            <span>{modal.subtitle}</span>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>✕</button>
        </div>
        <div className="team-detail-grid">
          {modal.details.map((detail) => (
            <article key={detail.label} className="team-member-meta-item">
              <span>{detail.label}</span>
              <strong>{detail.value}</strong>
            </article>
          ))}
        </div>
        <div className="dialog-actions">
          <button type="button" className="button button--outline" onClick={onClose}>Cancelar</button>
          <button type="button" className="button button--primary" onClick={onConfirm}>
            {modal.actionIcon} {modal.actionLabel}
          </button>
        </div>
      </section>
    </div>
  );
}