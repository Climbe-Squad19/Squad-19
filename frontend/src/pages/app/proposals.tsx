import { Tooltip } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProposalDetailModal from '../../components/modals/proposal-detail-modal';
import { ProposalCardItem } from '../../types';
import { useProposals } from '../../hooks/use-proposals';
import { criarProposta } from '../../services/business';
import { fetchEmpresas, type EmpresaApiResponse } from '../../services/empresas';

const SERVICOS = [
  'Valuation',
  'BPO Financeiro',
  'CFO Sob Demanda',
  'Fusões & Aquisições (M&A)',
  'Contabilidade',
];

export default function ProposalsPage() {
  const { search } = useOutletContext<{ search: string }>();
  const { proposalBoard, aprovarProposta, recusarProposta, reloadProposals, enviarParaAprovacao } = useProposals();
  const [selectedProposalDetail, setSelectedProposalDetail] = useState<(ProposalCardItem & { stage: string }) | null>(null);

  // Nova proposta
  const [showForm, setShowForm] = useState(false);
  const [empresas, setEmpresas] = useState<EmpresaApiResponse[]>([]);
  const [formEmpresaId, setFormEmpresaId] = useState('');
  const [formServico, setFormServico] = useState(SERVICOS[0]);
  const [formValorMensal, setFormValorMensal] = useState('');
  const [formValorSetup, setFormValorSetup] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const isValuationService = formServico === 'Valuation';

  useEffect(() => {
    if (showForm && empresas.length === 0) {
      fetchEmpresas()
        .then(setEmpresas)
        .catch(() => setFormError('Não foi possível carregar empresas.'));
    }
  }, [showForm]);

  async function handleCriarProposta() {
    if (!formEmpresaId) { setFormError('Selecione uma empresa.'); return; }
    if (!isValuationService && (!formValorMensal || isNaN(Number(formValorMensal)))) { setFormError('Informe um valor mensal valido.'); return; }
    setFormSubmitting(true);
    setFormError('');
    try {
      await criarProposta({
        empresaId: Number(formEmpresaId),
        servicoContratado: formServico,
        valorMensal: isValuationService ? undefined : Number(formValorMensal),
        valorSetup: formValorSetup ? Number(formValorSetup) : undefined,
        linkGoogleDrive: formLink || undefined,
      });
      setShowForm(false);
      setFormEmpresaId('');
      setFormServico(SERVICOS[0]);
      setFormValorMensal('');
      setFormValorSetup('');
      setFormLink('');
      reloadProposals();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Erro ao criar proposta.');
    } finally {
      setFormSubmitting(false);
    }
  }

  const searchTerm = search.trim().toLowerCase();
  const filteredProposalColumns = useMemo(
    () =>
      proposalBoard.map((column) => ({
        ...column,
        items: column.items.filter((item) =>
          !searchTerm || `${item.company} ${item.tag} ${item.amount}`.toLowerCase().includes(searchTerm)
        ),
      })),
    [proposalBoard, searchTerm]
  );

  return (
    <>
      {/* Modal nova proposta */}
      {showForm ? (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{ background: '#1c1c1f', borderRadius: '12px', padding: '28px', minWidth: '420px', maxWidth: '520px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: '#edf2f7' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Nova proposta</h3>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--color-text-muted, #94a3b8)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Empresa *
                <select
                  value={formEmpresaId}
                  onChange={(e) => setFormEmpresaId(e.target.value)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border, #334155)', background: '#0f172a', color: 'inherit', fontSize: '13px' }}
                >
                  <option value="">Selecione...</option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>{e.razaoSocial}</option>
                  ))}
                </select>
              </label>

              <label style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Serviço *
                <select
                  value={formServico}
                  onChange={(e) => {
                    setFormServico(e.target.value);
                    if (e.target.value === 'Valuation') {
                      setFormValorMensal('');
                    }
                  }}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border, #334155)', background: '#0f172a', color: 'inherit', fontSize: '13px' }}
                >
                  {SERVICOS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              {!isValuationService ? (
              <label style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Valor mensal (R$) *
                <input
                  type="number"
                  min="0"
                  value={formValorMensal}
                  onChange={(e) => setFormValorMensal(e.target.value)}
                  placeholder="Ex: 5000"
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border, #334155)', background: '#0f172a', color: 'inherit', fontSize: '13px' }}
                />
              </label>
              ) : null}

              <label style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Valor setup (R$)
                <input
                  type="number"
                  min="0"
                  value={formValorSetup}
                  onChange={(e) => setFormValorSetup(e.target.value)}
                  placeholder="Opcional"
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border, #334155)', background: '#0f172a', color: 'inherit', fontSize: '13px' }}
                />
              </label>

              <label style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Link Google Drive
                <input
                  type="text"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="Opcional"
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border, #334155)', background: '#0f172a', color: 'inherit', fontSize: '13px' }}
                />
              </label>

              {formError ? <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{formError}</p> : null}

              <button
                type="button"
                disabled={formSubmitting}
                onClick={() => void handleCriarProposta()}
                style={{ padding: '10px', borderRadius: '8px', border: 'none', background: '#79C6C0', color: '#0f172a', cursor: formSubmitting ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: formSubmitting ? 0.7 : 1, fontWeight: 600 }}
              >
                {formSubmitting ? 'Salvando...' : 'Criar proposta'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="panel stacked-panel">
        <div className="section-topbar">
          <div>
            <h3>Propostas comerciais</h3>
            <span>Acompanhamento rápido das oportunidades</span>
          </div>
          <div className="section-actions">
            <button
              type="button"
              className="button button--primary section-create-button"
              onClick={() => setShowForm(true)}
            >
              + Nova proposta
            </button>
          </div>
        </div>

        <div className="proposal-board">
          {filteredProposalColumns.map((column) => (
            <section key={column.title} className="proposal-column">
              <div className="proposal-column-header">{column.title}</div>
              <div className="proposal-column-list">
                {column.items.map((item, index) => (
                  <article key={`${column.title}-${item.company}-${index}`} className="proposal-card">
                    <div className="proposal-card-top">
                      <strong>{item.company}</strong>
                      {item.amount ? <small>{item.amount}</small> : null}
                    </div>
                    <div className="proposal-card-middle">
                      <span className={`proposal-chip proposal-chip--${item.tag.toLowerCase()}`}>{item.tag}</span>
                    </div>
                    <div className="proposal-card-bottom">
                      <span className="proposal-card-avatar">M</span>
                      <small>{item.createdLabel}</small>
                    </div>
                    <Tooltip title="Ver detalhes" arrow>
                      <button
                        type="button"
                        className="icon-button detail-icon-button"
                        onClick={() => setSelectedProposalDetail({ ...item, stage: column.title })}
                      >
                        ⌕
                      </button>
                    </Tooltip>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <ProposalDetailModal
        detail={selectedProposalDetail}
        onClose={() => setSelectedProposalDetail(null)}
        onApprove={aprovarProposta}
        onReject={recusarProposta}
        onEnviar={enviarParaAprovacao}
      />
    </>
  );
}

