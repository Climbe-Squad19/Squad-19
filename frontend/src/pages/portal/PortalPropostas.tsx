import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchPortalPropostas, updatePortalPropostaStatus, getPortalEmpresaId } from '../../services/portal';
import type { PropostaApiResponse } from '../../services/business';

const COLUMNS: { key: string; label: string }[] = [
  { key: 'ELABORACAO', label: 'Em elaboração' },
  { key: 'ENVIADA', label: 'Aguardando sua resposta' },
  { key: 'ACEITA', label: 'Aceitas' },
  { key: 'RECUSADA', label: 'Recusadas' },
];

const cardBorderColor: Record<string, string> = {
  ACEITA: '#16a34a',
  RECUSADA: '#dc2626',
  ENVIADA: '#d97706',
  ELABORACAO: '#334155',
};

const cardBgColor: Record<string, string> = {
  ACEITA: 'rgba(22,163,74,0.07)',
  RECUSADA: 'rgba(220,38,38,0.07)',
  ENVIADA: 'rgba(217,119,6,0.07)',
  ELABORACAO: 'transparent',
};

const statusLabels: Record<string, string> = {
  ELABORACAO: 'Em elaboração',
  ENVIADA: 'Aguardando resposta',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
};

const statusChipClass: Record<string, string> = {
  ELABORACAO: 'text-zinc-200 bg-zinc-800',
  ENVIADA: 'text-amber-200 bg-amber-950',
  ACEITA: 'text-emerald-200 bg-emerald-950',
  RECUSADA: 'text-rose-200 bg-rose-950',
};

type ModalData = {
  proposta: PropostaApiResponse;
};

export default function PortalPropostasPage() {
  const [propostas, setPropostas] = useState<PropostaApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalData | null>(null);

  const empresaId = getPortalEmpresaId();

  useEffect(() => {
    if (!empresaId) {
      setLoading(false);
      return;
    }
    fetchPortalPropostas(empresaId)
      .then(setPropostas)
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Erro ao carregar propostas'))
      .finally(() => setLoading(false));
  }, [empresaId]);

  async function handleUpdateStatus(propostaId: number, status: 'ACEITA' | 'RECUSADA') {
    setSubmittingId(propostaId);
    try {
      await updatePortalPropostaStatus(propostaId, status);
      setPropostas((current) =>
        current.map((item) => (item.id === propostaId ? { ...item, status } : item))
      );
      toast.success(`Proposta ${status === 'ACEITA' ? 'aceita' : 'recusada'} com sucesso.`);
      setModal(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar status');
    } finally {
      setSubmittingId(null);
    }
  }

  const propostasByStatus = (status: string) => propostas.filter((p) => p.status === status);

  return (
    <>
      {/* Modal de detalhes */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModal(null)}
        >
          <section
            style={{ background: 'var(--color-surface, #1e1e2e)', borderRadius: 12, padding: 28, minWidth: 360, maxWidth: 480, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{modal.proposta.nomeEmpresa}</h3>
              <button type="button" onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>Serviço</span>
                <strong style={{ fontSize: 13 }}>{modal.proposta.servicoContratado || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>Valor mensal</span>
                <strong style={{ fontSize: 13 }}>{modal.proposta.valorMensal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>Status</span>
                <span className={`detail-table-status ${statusChipClass[modal.proposta.status] ?? ''}`} style={{ fontSize: 12 }}>
                  {statusLabels[modal.proposta.status] ?? modal.proposta.status}
                </span>
              </div>
            </div>

            {modal.proposta.linkGoogleDrive && (
              <button
                type="button"
                className="button button--outline"
                style={{ width: '100%', marginBottom: 12 }}
                onClick={() => window.open(modal.proposta.linkGoogleDrive!, '_blank')}
              >
                Analisar proposta
              </button>
            )}

            {modal.proposta.status === 'ENVIADA' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="button button--outline"
                  style={{ flex: 1, borderColor: '#dc2626', color: '#dc2626' }}
                  disabled={submittingId === modal.proposta.id}
                  onClick={() => void handleUpdateStatus(modal.proposta.id, 'RECUSADA')}
                >
                  Recusar
                </button>
                <button
                  type="button"
                  className="button button--primary"
                  style={{ flex: 1 }}
                  disabled={submittingId === modal.proposta.id}
                  onClick={() => void handleUpdateStatus(modal.proposta.id, 'ACEITA')}
                >
                  Aceitar
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      <div className="panel stacked-panel">
        <div className="section-topbar">
          <div>
            <h3>Propostas</h3>
            <span>Acompanhe as propostas da sua empresa</span>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-zinc-400">Carregando propostas...</div>
        ) : (
          <div className="proposal-board">
            {COLUMNS.map((col) => {
              const items = propostasByStatus(col.key);
              return (
                <section key={col.key} className="proposal-column">
                  <div className="proposal-column-header">
                    {col.label}
                    <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.6 }}>({items.length})</span>
                  </div>
                  <div className="proposal-column-list">
                    {items.length === 0 ? (
                      <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 16 }}>Nenhuma proposta</p>
                    ) : (
                      items.map((proposta) => (
                        <article
                          key={proposta.id}
                          className="proposal-card"
                          style={{
                            borderColor: cardBorderColor[proposta.status] ?? '#334155',
                            background: cardBgColor[proposta.status] ?? 'transparent',
                          }}
                        >
                          <div className="proposal-card-top">
                            <strong style={{ fontSize: 13 }}>{proposta.servicoContratado || '—'}</strong>
                            <small>{proposta.valorMensal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '—'}</small>
                          </div>
                          <div className="proposal-card-middle">
                            <span className={`detail-table-status ${statusChipClass[proposta.status] ?? ''}`} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999 }}>
                              {statusLabels[proposta.status] ?? proposta.status}
                            </span>
                          </div>
                          <div className="proposal-card-bottom" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="icon-button detail-icon-button"
                              title="Ver detalhes"
                              onClick={() => setModal({ proposta })}
                            >
                              ⌕
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
