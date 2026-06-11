import { Tooltip } from '@mui/material';
import { useMemo, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { companyReports } from '../../mocks/business.mock';
import { useCompanies } from '../../hooks/use-companies';
import { EntityActionModal } from '../../types';
import EntityActionModalData from '../../components/modals/entity-action-modal';
import { useAppSelector } from '../../store/hooks';
import { uploadDocumentoContrato } from '../../services/contratos-documentos';
import { listarDocumentosContrato, downloadDocumentoContrato } from '../../services/contratos-documentos';

export default function CompaniesPage() {
  const { search } = useOutletContext<{ search: string }>();
  const profile = useAppSelector((state) => state.profile);
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
  const [uploadingContratoId, setUploadingContratoId] = useState<number | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<{ contratoId: number; message: string; ok: boolean } | null>(null);

  const searchTerm = search.trim().toLowerCase();
  const filteredCompanies = useMemo(
    () =>
      companies.filter((company) =>
        !searchTerm || `${company.name} ${company.document} ${company.status} ${company.tags.join(' ')}`.toLowerCase().includes(searchTerm)
      ),
    [companies, searchTerm]
  );

  async function handleUploadPDF(contratoCode: string, files: FileList) {
  const contratoId = Number(contratoCode.replace('CTR-', ''));
  if (!contratoId || files.length === 0) return;
  setUploadingContratoId(contratoId);
  setUploadFeedback(null);
  try {
    const uploads = Array.from(files).map((file) =>
      uploadDocumentoContrato(contratoId, profile.id ?? 1, file).then((res) => {
        if (!res.ok) throw new Error(`Erro ao enviar "${file.name}"`);
      })
    );
    const count = files.length;
    await Promise.all(uploads);
    setUploadFeedback({ contratoId, message: `${count} arquivo${count > 1 ? 's' : ''} anexado${count > 1 ? 's' : ''} com sucesso!`, ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Não foi possível enviar os arquivos.';
    setUploadFeedback({ contratoId, message: msg, ok: false });
  } finally {
    setUploadingContratoId(null);
  }
}  

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
    setUploadFeedback(null);
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <strong>{item.title}</strong>
                    <small style={{ color: '#9ab0d6' }}>{item.service}</small>
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
              {companyContractsData.map((item) => {
                const contratoId = (item as { id?: number; code: string }).id ?? Number(item.code.replace('CTR-', ''));
                const isUploading = uploadingContratoId === contratoId;
                const feedback = uploadFeedback?.contratoId === contratoId ? uploadFeedback : null;
                return (
                  <article key={item.code} className="detail-table-row">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <strong>{item.code}</strong>
                      <small style={{ color: '#9ab0d6' }}>{item.service}</small>
                    </div>
                    <span>{item.startDate}</span>
                    <span className="detail-table-status">{item.status}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
  <Tooltip title="Anexar PDF ao contrato" arrow>
    <label style={{ display: 'flex' }}>
      <button
        type="button"
        className="icon-button detail-icon-button"
        style={{ opacity: isUploading ? 0.6 : 1, cursor: isUploading ? 'not-allowed' : 'pointer' }}
        onClick={() => (document.getElementById(`upload-${contratoId}`) as HTMLInputElement)?.click()}
        disabled={uploadingContratoId !== null}
      >
        {isUploading ? '⏳' : '↑'}
      </button>
      <input
        id={`upload-${contratoId}`}
        type="file"
        accept="application/pdf"
        multiple
        style={{ display: 'none' }}
        disabled={uploadingContratoId !== null}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            void handleUploadPDF(item.code, e.target.files);
          }
          e.target.value = '';
        }}
      />
    </label>
  </Tooltip>

  <Tooltip title="Visualizar documento" arrow>
    <button
      type="button"
      className="icon-button detail-icon-button"
      onClick={async () => {
  const res = await listarDocumentosContrato(contratoId);
  const docs = await res.json();
  if (docs && docs.length > 0) {
    const ultimo = docs[docs.length - 1];
    const dlRes = await downloadDocumentoContrato(contratoId, ultimo.id);
    const blob = await dlRes.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } else {
    alert('Nenhum documento encontrado para este contrato.');
  }
}}
    >
      ⌕
    </button>
  </Tooltip>
</div>
                    {feedback ? (
                      <small style={{ color: feedback.ok ? '#16a34a' : '#dc2626', fontSize: '11px' }}>
                        {feedback.message}
                      </small>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : null}

          {companyDetailTab === 'Documentos' ? (
            <div className="detail-table-list">
              {companyDocumentsData.map((item) => (
                <article key={item.name} className="detail-table-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <strong>{item.name}</strong>
                      <small style={{ color: '#9ab0d6' }}>{item.category}</small>
                    </div>
                  <span className="detail-table-status">{item.status}</span>
                </article>
              ))}
            </div>
          ) : null}

          {companyDetailTab === 'Reuniões' ? (
            <div className="detail-table-list">
              {companyMeetingsData.map((item) => (
                <article key={`${item.topic}-${item.date}`} className="detail-table-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <strong>{item.topic}</strong>
                    <small style={{ color: '#9ab0d6' }}>{item.channel}</small>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <strong>{item.title}</strong>
                    <small style={{ color: '#9ab0d6' }}>{item.period}</small>
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
            <div className="section-actions"></div>
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
