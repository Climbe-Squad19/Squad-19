import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchPortalReunioes, getPortalEmpresaId } from '../../services/portal';
import type { ReuniaoApiResponse } from '../../services/business';

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function PortalReunioesPage() {
  const [reunioes, setReunioes] = useState<ReuniaoApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const empresaId = getPortalEmpresaId();

  useEffect(() => {
    if (!empresaId) {
      setLoading(false);
      return;
    }

    fetchPortalReunioes(empresaId)
      .then(setReunioes)
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Erro ao carregar reuniões'))
      .finally(() => setLoading(false));
  }, [empresaId]);

  return (
    <div className="panel stacked-panel">
      <div className="section-topbar">
        <div>
          <h3>Reuniões</h3>
          <span>Programe-se para os próximos encontros</span>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-zinc-400">Carregando reuniões...</div>
      ) : (
        <div className="grid gap-4">
          {reunioes.length === 0 ? (
            <div className="px-6 py-8 text-sm text-zinc-400 text-center">Nenhuma reunião encontrada.</div>
          ) : (
            reunioes.map((reuniao) => {
              const tipo = reuniao.presencial
                ? `Presencial${reuniao.sala ? ` - Sala ${reuniao.sala}` : ''}`
                : 'Online';

              return (
                <article key={reuniao.id} className="portal-meeting-card p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="portal-meeting-title text-base font-semibold">{reuniao.pauta || 'Sem pauta'}</h4>
                      <p className="portal-meeting-date text-sm mt-2">{formatDateTime(reuniao.dataHora)}</p>
                    </div>
                    <div className="portal-meeting-badge rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                      {tipo}
                    </div>
                  </div>
                  {!reuniao.presencial && reuniao.linkOnline ? (
                    <div className="mt-4">
                      <a
                        href={reuniao.linkOnline}
                        target="_blank"
                        rel="noreferrer"
                        className="button button--primary"
                      >
                        Entrar na reunião
                      </a>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
