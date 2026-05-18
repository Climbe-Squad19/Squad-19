import { Tooltip } from '@mui/material';
import { useMemo, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { companyReports } from '../../mocks/business.mock';
import { useCompanies } from '../../hooks/use-companies';
import { EntityActionModal } from '../../types';
import EntityActionModalData from '../../components/modals/entity-action-modal';

export default function CompaniesPage() {
  const { search } = useOutletContext<{ search: string }>();
  const {
    companies,
    setCompanies,
    selectedCompany,
    setSelectedCompany,
    companyDetailTab,
    setCompanyDetailTab,
    companyProposalsData,
    companyContractsData,
    companyDocumentsData,
    companyMeetingsData,
    mapEmpresaToCard,
  } = useCompanies();
  const [showCompanyCreatePanel, setShowCompanyCreatePanel] = useState(false);
  const [companyFormName, setCompanyFormName] = useState('');
  const [companyFormDocument, setCompanyFormDocument] = useState('');
  const [companyFormTags, setCompanyFormTags] = useState('BPO');
  const [companyFormStatus, setCompanyFormStatus] = useState<'Ativa' | 'Inativa'>('Ativa');
  const [companyFormSubmitting, setCompanyFormSubmitting] = useState(false);
  const [companyFormError, setCompanyFormError] = useState('');
  const [entityActionModal, setEntityActionModal] = useState<EntityActionModal | null>(null);

  const searchTerm = search.trim().toLowerCase();
  const filteredCompanies = useMemo(
    () =>
      companies.filter((company) =>
        !searchTerm || `${company.name} ${company.document} ${company.status} ${company.tags.join(' ')}`.toLowerCase().includes(searchTerm)
      ),
    [companies, searchTerm]
  );

  function resetForm() {
    setCompanyFormName('');
    setCompanyFormDocument('');
    setCompanyFormTags('BPO');
    setCompanyFormStatus('Ativa');
    setCompanyFormError('');
  }

  function openCompanyDetails(company: (typeof companies)[number]) {
    setSelectedCompany(company);
    setCompanyDetailTab('Visão geral');
    setShowCompanyCreatePanel(false);
  }

  function confirmEntityActionPreview() {
    if (!entityActionModal) {
      return;
    }
    if (entityActionModal.variant === 'download') {
      const blob = new Blob([entityActionModal.fileContent ?? entityActionModal.title], {
        type: 'text/plain;charset=utf-8',
      });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = entityActionModal.fileName ?? 'arquivo.txt';
      link.click();
      URL.revokeObjectURL(downloadUrl);
    }
    setEntityActionModal(null);
  }

  async function handleCreateCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCompanyFormSubmitting(true);
    setCompanyFormError('');
    try {
      const fakeEmpresa = mapEmpresaToCard({
        id: Date.now(),
        razaoSocial: companyFormName,
        cnpj: companyFormDocument,
        ativa: companyFormStatus === 'Ativa',
        dataCadastro: new Date().toISOString(),
      });
      fakeEmpresa.tags = companyFormTags.split(',').map((tag) => tag.trim()).filter(Boolean);
      setCompanies((current) => [fakeEmpresa, ...current]);
      resetForm();
      setShowCompanyCreatePanel(false);
    } catch (error) {
      setCompanyFormError(error instanceof Error ? error.message : 'Não foi possível criar a empresa.');
    } finally {
      setCompanyFormSubmitting(false);
    }
  }

  return (
    <>
      {selectedCompany ? (
        <section className="panel stacked-panel">
          <div className="section-topbar">
            <div>
              <h3>{selectedCompany.name}</h3>
              <span>{selectedCompany.document} · {selectedCompany.status}</span>
            </div>
            <div className="section-actions">
              <button type="button" className="button button--outline" onClick={() => setSelectedCompany(null)}>
                Voltar para empresas
              </button>
            </div>
          </div>

          <div className="detail-tabs">
            {['Visão geral', 'Propostas', 'Contratos', 'Documentos', 'Reuniões', 'Relatórios'].map((tab) => (
              <button key={tab} type="button" className={`detail-tab-button ${companyDetailTab === tab ? 'active' : ''}`} onClick={() => setCompanyDetailTab(tab as typeof companyDetailTab)}>
                {tab}
              </button>
            ))}
          </div>

          {companyDetailTab === 'Visão geral' ? (
            <div className="company-detail-layout">
              <div className="company-detail-hero panel">
                <div className="company-card-header">
                  <div className="company-avatar">{selectedCompany.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                  <div className="company-detail-copy">
                    <strong>{selectedCompany.name}</strong>
                    <small>{selectedCompany.document}</small>
                  </div>
                </div>
                <div className="company-tags">
                  {selectedCompany.tags.map((tag) => (
                    <span key={tag} className={`proposal-chip proposal-chip--${tag.toLowerCase()}`}>{tag}</span>
                  ))}
                </div>
                <div className="company-status-row">
                  <span className={`company-status-dot company-status-dot--${selectedCompany.status.toLowerCase()}`} />
                  <small>{selectedCompany.status} <span>{selectedCompany.statusSince}</span></small>
                </div>
              </div>

              <div className="company-metrics-grid">
                {[
                  { label: 'Contratos ativos', value: `${companyContractsData.filter((item) => item.status.toUpperCase() === 'ATIVO').length}` },
                  { label: 'Propostas abertas', value: `${companyProposalsData.length}` },
                  { label: 'Documentos', value: `${companyDocumentsData.length}` },
                  { label: 'Reuniões', value: `${companyMeetingsData.length}` },
                ].map((item) => (
                  <article key={item.label} className="company-metric-card">
                    <small className="company-metric-label">{item.label}</small>
                    <strong className="company-metric-value">{item.value}</strong>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {companyDetailTab === 'Propostas' ? (
            <div className="detail-table-list">
              {companyProposalsData.map((item) => (
                <article key={item.title} className="detail-table-row">
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.service}</small>
                  </div>
                  <span>{item.amount}</span>
                  <span className="detail-table-status">{item.status}</span>
                  <Tooltip title="Ver detalhes" arrow>
                    <button type="button" className="icon-button detail-icon-button" onClick={() => setEntityActionModal({
                      title: item.title,
                      subtitle: 'Detalhes da proposta comercial',
                      actionLabel: 'Fechar',
                      actionIcon: '⌕',
                      details: [
                        { label: 'Serviço', value: item.service },
                        { label: 'Valor', value: item.amount },
                        { label: 'Status', value: item.status },
                      ],
                    })}>
                      ⌕
                    </button>
                  </Tooltip>
                </article>
              ))}
            </div>
          ) : null}

          {companyDetailTab === 'Contratos' ? (
            <div className="detail-table-list">
              {companyContractsData.map((item) => (
                <article key={item.code} className="detail-table-row">
                  <div>
                    <strong>{item.code}</strong>
                    <small>{item.service}</small>
                  </div>
                  <span>{item.startDate}</span>
                  <span className="detail-table-status">{item.status}</span>
                </article>
              ))}
            </div>
          ) : null}

          {companyDetailTab === 'Documentos' ? (
            <div className="detail-table-list">
              {companyDocumentsData.map((item) => (
                <article key={item.name} className="detail-table-row">
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.category}</small>
                  </div>
                  <span className="detail-table-status">{item.status}</span>
                  {item.downloadUrl && (
                    <Tooltip title="Visualizar documento" arrow>
                      <button
                        type="button"
                        className="icon-button detail-icon-button"
                        onClick={() => window.open(item.downloadUrl, '_blank')}
                      >
                        ⌕
                      </button>
                    </Tooltip>
                  )}
                </article>
              ))}
            </div>
          ) : null}

          {companyDetailTab === 'Reuniões' ? (
            <div className="detail-table-list">
              {companyMeetingsData.map((item) => (
                <article key={`${item.topic}-${item.date}`} className="detail-table-row">
                  <div>
                    <strong>{item.topic}</strong>
                    <small>{item.channel}</small>
                  </div>
                  <span>{item.date}</span>
                </article>
              ))}
            </div>
          ) : null}

          {companyDetailTab === 'Relatórios' ? (
            <div className="detail-table-list">
              {companyReports.map((item) => (
                <article key={item.title} className="detail-table-row">
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.period}</small>
                  </div>
                  <span className="detail-table-status">{item.status}</span>
                  <Tooltip title="Baixar relatório" arrow>
                    <button type="button" className="icon-button detail-icon-button" onClick={() => setEntityActionModal({
                      title: item.title,
                      subtitle: 'Relatório pronto para download',
                      actionLabel: 'Baixar agora',
                      actionIcon: '↓',
                      variant: 'download',
                      fileName: `${item.title.toLowerCase().replace(/\s+/g, '-')}.txt`,
                      fileContent: [`Relatório: ${item.title}`, `Período: ${item.period}`, `Status: ${item.status}`].join('\n'),
                      details: [
                        { label: 'Período', value: item.period },
                        { label: 'Status', value: item.status },
                        { label: 'Formato', value: 'TXT de demonstração' },
                      ],
                    })}>
                      ↓
                    </button>
                  </Tooltip>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : (
        <section className="panel stacked-panel">
          <div className="section-topbar">
            <div>
              <h3>Empresas</h3>
              <span>{filteredCompanies.length} empresa(s) listada(s)</span>
            </div>
            <div className="section-actions">
              <button type="button" className="button button--primary section-create-button" onClick={() => setShowCompanyCreatePanel(true)}>
                + Nova empresa
              </button>
            </div>
          </div>

          {showCompanyCreatePanel ? (
            <section className="agenda-create-layout company-create-layout">
              <div className="company-grid">
                {filteredCompanies.map((company) => (
                  <article key={company.name} className="company-card company-card--interactive">
                    <div className="company-card-header">
                      <div className="company-avatar">{company.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                      <div>
                        <strong>{company.name}</strong>
                        <small>{company.document}</small>
                      </div>
                    </div>
                    <div className="company-tags">
                      {company.tags.map((tag) => (
                        <span key={tag} className={`proposal-chip proposal-chip--${tag.toLowerCase()}`}>{tag}</span>
                      ))}
                    </div>
                    <div className="company-status-row">
                      <span className={`company-status-dot company-status-dot--${company.status.toLowerCase()}`} />
                      <small>{company.status} <span>{company.statusSince}</span></small>
                    </div>
                    <button type="button" className="button button--outline company-open-button" onClick={() => openCompanyDetails(company)}>
                      Abrir detalhes
                    </button>
                  </article>
                ))}
              </div>
              <div className="panel agenda-create-sidepanel company-create-sidepanel">
                <div className="panel-header">
                  <div>
                    <h3>Criar nova empresa</h3>
                    <span>Cadastre um novo cliente na base</span>
                  </div>
                  <button type="button" className="icon-button" onClick={() => setShowCompanyCreatePanel(false)}>←</button>
                </div>
                <form className="agenda-form" onSubmit={handleCreateCompany}>
                  <label>
                    Nome da empresa
                    <input type="text" value={companyFormName} onChange={(event) => setCompanyFormName(event.target.value)} required />
                  </label>
                  <label>
                    Documento
                    <input type="text" value={companyFormDocument} onChange={(event) => setCompanyFormDocument(event.target.value)} required />
                  </label>
                  <label>
                    Categoria
                    <input type="text" value={companyFormTags} onChange={(event) => setCompanyFormTags(event.target.value)} required />
                  </label>
                  <label>
                    Status
                    <input type="text" value={companyFormStatus} onChange={(event) => setCompanyFormStatus(event.target.value === 'Inativa' ? 'Inativa' : 'Ativa')} />
                  </label>
                  {companyFormError ? <p className="form-error">{companyFormError}</p> : null}
                  <button type="submit" className="button button--primary" disabled={companyFormSubmitting}>
                    {companyFormSubmitting ? 'Salvando...' : 'Salvar empresa'}
                  </button>
                </form>
              </div>
            </section>
          ) : (
            <div className="company-grid">
              {filteredCompanies.map((company) => (
                <article key={company.name} className="company-card company-card--interactive">
                  <div className="company-card-header">
                    <div className="company-avatar">{company.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                    <div>
                      <strong>{company.name}</strong>
                      <small>{company.document}</small>
                    </div>
                  </div>
                  <div className="company-tags">
                    {company.tags.map((tag) => (
                      <span key={tag} className={`proposal-chip proposal-chip--${tag.toLowerCase()}`}>{tag}</span>
                    ))}
                  </div>
                  <div className="company-status-row">
                    <span className={`company-status-dot company-status-dot--${company.status.toLowerCase()}`} />
                    <small>{company.status} <span>{company.statusSince}</span></small>
                  </div>
                  <button type="button" className="button button--outline company-open-button" onClick={() => openCompanyDetails(company)}>
                    Abrir detalhes
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <EntityActionModalData modal={entityActionModal} onClose={() => setEntityActionModal(null)} onConfirm={confirmEntityActionPreview} />
    </>
  );
}