import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchPortalPropostas, updatePortalPropostaStatus, getPortalEmpresaId } from '../../services/portal';
import type { PropostaApiResponse } from '../../services/business';

const statusLabels: Record<string, string> = {
  ELABORACAO: 'Em elaboração',
  ENVIADA: 'Aguardando sua resposta',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
};

const statusClasses: Record<string, string> = {
  ELABORACAO: 'text-zinc-200 bg-zinc-800',
  ENVIADA: 'text-amber-200 bg-amber-950',
  ACEITA: 'text-emerald-200 bg-emerald-950',
  RECUSADA: 'text-rose-200 bg-rose-950',
};

export default function PortalPropostasPage() {
  const [propostas, setPropostas] = useState<PropostaApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

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
      setPropostas((current) => current.map((item) => (item.id === propostaId ? { ...item, status } : item)));
      toast.success(`Proposta ${status === 'ACEITA' ? 'aceita' : 'recusada'} com sucesso.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar status');
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="panel stacked-panel">
      <div className="section-topbar">
        <div>
          <h3>Propostas</h3>
          <span>Veja as propostas da sua empresa</span>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-zinc-400">Carregando propostas...</div>
      ) : propostas.length === 0 ? (
        <div className="p-6 text-zinc-400 text-center">Nenhuma proposta encontrada para esta empresa.</div>
      ) : (
        <div className="detail-table-list">
          {propostas.map((proposta) => (
            <article key={proposta.id} className="detail-table-row">
              <div>
                <strong>{proposta.servicoContratado || '—'}</strong>
                <small className="text-zinc-400">Serviço</small>
              </div>

              <div>
                <strong>{proposta.valorMensal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '—'}</strong>
                <small className="text-zinc-400">Valor mensal</small>
              </div>

              <div>
                <span className={`detail-table-status ${statusClasses[proposta.status] ?? ''}`}>
                  {statusLabels[proposta.status] ?? proposta.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {proposta.status === 'ENVIADA' ? (
                  <>
                    <button
                      type="button"
                      disabled={submittingId === proposta.id}
                      onClick={() => void handleUpdateStatus(proposta.id, 'ACEITA')}
                      className="button button--primary"
                    >
                      Aceitar
                    </button>
                    <button
                      type="button"
                      disabled={submittingId === proposta.id}
                      onClick={() => void handleUpdateStatus(proposta.id, 'RECUSADA')}
                      className="button button--outline"
                    >
                      Recusar
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-zinc-500">Sem ações</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
