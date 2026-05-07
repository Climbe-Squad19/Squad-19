type LogoutConfirmModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function LogoutConfirmModal({ open, onConfirm, onCancel }: LogoutConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <section className="dialog-card dialog-card--compact" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <div>
            <h3>Sair da conta</h3>
            <span>Deseja encerrar a sessão atual?</span>
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="button button--outline" onClick={onCancel}>Cancelar</button>
          <button type="button" className="button button--primary" onClick={onConfirm}>Confirmar saída</button>
        </div>
      </section>
    </div>
  );
}
