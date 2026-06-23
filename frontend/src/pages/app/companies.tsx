import { Tooltip } from '@mui/material';
import { CheckCircle, MoreVertical, Search, XCircle } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { companyReports } from '../../mocks/business.mock';
import { useCompanies } from '../../hooks/use-companies';
import { EntityActionModal } from '../../types';
import EntityActionModalData from '../../components/modals/entity-action-modal';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { uploadDocumentoContrato } from '../../services/contratos-documentos';
import { listarDocumentosContrato, downloadDocumentoContrato } from '../../services/contratos-documentos';
import { downloadDocumentoEmpresa, validarDocumentoEmpresa } from '../../services/business';
import { createEmpresa } from '../../services/empresas';
import { openNotifications } from '../../store/uiSlice';

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function maskCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function maskCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function maskTelefone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function maskCep(value: string): string {
  return onlyDigits(value).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
}

const DOCUMENT_REJECTION_REASONS = [
  'Documento errado foi anexado',
  'Documento ilegível',
  'Documento desnecessário',
];

export default function CompaniesPage() {
  const { search } = useOutletContext<{ search: string }>();
  const dispatch = useAppDispatch();
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
    setCompanyDocumentsData,
    companyMeetingsData,
    mapEmpresaToCard,
  } = useCompanies();
  const [showCompanyCreatePanel, setShowCompanyCreatePanel] = useState(false);
  const [companyFormName, setCompanyFormName] = useState('');
  const [companyFormFantasyName, setCompanyFormFantasyName] = useState('');
  const [companyFormDocument, setCompanyFormDocument] = useState('');
  const [companyFormEmail, setCompanyFormEmail] = useState('');
  const [companyFormPhone, setCompanyFormPhone] = useState('');
  const [companyFormRepresentative, setCompanyFormRepresentative] = useState('');
  const [companyFormRepresentativeCpf, setCompanyFormRepresentativeCpf] = useState('');
  const [companyFormRepresentativeContact, setCompanyFormRepresentativeContact] = useState('');
  const [companyFormStreet, setCompanyFormStreet] = useState('');
  const [companyFormNumber, setCompanyFormNumber] = useState('');
  const [companyFormDistrict, setCompanyFormDistrict] = useState('');
  const [companyFormCity, setCompanyFormCity] = useState('');
  const [companyFormUf, setCompanyFormUf] = useState('');
  const [companyFormCep, setCompanyFormCep] = useState('');
  const [companyFormTags, setCompanyFormTags] = useState('BPO');
  const [companyFormSubmitting, setCompanyFormSubmitting] = useState(false);
  const [companyFormError, setCompanyFormError] = useState('');
  const [entityActionModal, setEntityActionModal] = useState<EntityActionModal | null>(null);
  const [documentActionId, setDocumentActionId] = useState<number | null>(null);
  const [rejectingDocument, setRejectingDocument] = useState<(typeof companyDocumentsData)[number] | null>(null);
  const [validatingDocumentId, setValidatingDocumentId] = useState<number | null>(null);
  const [uploadingContratoId, setUploadingContratoId] = useState<number | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<{ contratoId: number; message: string; ok: boolean } | null>(null);
  const [docsModal, setDocsModal] = useState<{ contratoId: number; docs: { id: number; nomeArquivo: string }[] } | null>(null);

  const searchTerm = search.trim().toLowerCase();
  const canCreateCompany = profile.role === 'CEO';
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
    setCompanyFormFantasyName('');
    setCompanyFormDocument('');
    setCompanyFormEmail('');
    setCompanyFormPhone('');
    setCompanyFormRepresentative('');
    setCompanyFormRepresentativeCpf('');
    setCompanyFormRepresentativeContact('');
    setCompanyFormStreet('');
    setCompanyFormNumber('');
    setCompanyFormDistrict('');
    setCompanyFormCity('');
    setCompanyFormUf('');
    setCompanyFormCep('');
    setCompanyFormTags('BPO');
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

  async function handleOpenCompanyDocument(item: (typeof companyDocumentsData)[number]) {
    if (item.fileUrl) {
      window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (!item.id) {
      alert('Documento indisponível para visualização.');
      return;
    }

    const tab = window.open('about:blank', '_blank');
    if (tab) {
      tab.opener = null;
    }

    try {
      const blob = await downloadDocumentoEmpresa(item.id);
      const url = URL.createObjectURL(blob);
      if (tab) {
        tab.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) {
      tab?.close();
      console.error('Erro ao abrir documento da empresa', error);
      alert('Não foi possível abrir o documento anexado.');
    }
  }

  async function handleValidateCompanyDocument(item: (typeof companyDocumentsData)[number]) {
    if (!item.id || !profile.id) {
      dispatch(openNotifications('Não foi possível validar o documento.'));
      return;
    }

    setValidatingDocumentId(item.id);
    setDocumentActionId(null);
    try {
      const updated = await validarDocumentoEmpresa(item.id, profile.id, true);
      setCompanyDocumentsData((current) =>
        current.map((doc) =>
          doc.id === item.id
            ? {
                ...doc,
                status: updated.status || 'APROVADO',
                rejectionReason: undefined,
              }
            : doc
        )
      );
      dispatch(openNotifications('Documento aceito com sucesso.'));
    } catch (error) {
      dispatch(openNotifications(error instanceof Error ? error.message : 'Erro ao aceitar documento.'));
    } finally {
      setValidatingDocumentId(null);
    }
  }

  async function handleRejectCompanyDocument(reason: string) {
    if (!rejectingDocument?.id || !profile.id) {
      dispatch(openNotifications('Não foi possível recusar o documento.'));
      return;
    }

    setValidatingDocumentId(rejectingDocument.id);
    try {
      await validarDocumentoEmpresa(rejectingDocument.id, profile.id, false, reason);
      setCompanyDocumentsData((current) => current.filter((doc) => doc.id !== rejectingDocument.id));
      setRejectingDocument(null);
      setDocumentActionId(null);
      dispatch(openNotifications('Documento recusado com sucesso.'));
    } catch (error) {
      dispatch(openNotifications(error instanceof Error ? error.message : 'Erro ao recusar documento.'));
    } finally {
      setValidatingDocumentId(null);
    }
  }

  async function handleCreateCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreateCompany) {
      setCompanyFormError('Apenas usuarios com cargo CEO podem cadastrar novas empresas parceiras.');
      return;
    }
    setCompanyFormSubmitting(true);
    setCompanyFormError('');
    try {
      const empresaCriada = await createEmpresa({
        razaoSocial: companyFormName.trim(),
        nomeFantasia: companyFormFantasyName.trim() || companyFormName.trim(),
        cnpj: onlyDigits(companyFormDocument),
        logradouro: companyFormStreet.trim(),
        numero: companyFormNumber.trim(),
        bairro: companyFormDistrict.trim(),
        cidade: companyFormCity.trim(),
        uf: companyFormUf.trim().toUpperCase(),
        cep: onlyDigits(companyFormCep),
        telefone: onlyDigits(companyFormPhone),
        emailContato: companyFormEmail.trim(),
        nomeRepresentante: companyFormRepresentative.trim(),
        cpfRepresentante: onlyDigits(companyFormRepresentativeCpf),
        contatoRepresentante: onlyDigits(companyFormRepresentativeContact),
      });
      const fakeEmpresa = mapEmpresaToCard(empresaCriada);
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
                  <span className="detail-table-status" data-status={item.status}>
  {item.status}
</span>
                  <Tooltip title="Ver detalhes" arrow>
                    <button type="button" className="icon-button detail-icon-button" onClick={() => setEntityActionModal({
                      title: item.title,
                      subtitle: 'Detalhes da proposta comercial',
                      actionLabel: 'Fechar',
                      actionIcon: '',
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
                    <span className="detail-table-status" data-status={item.status}>
  {item.status}
</span>
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

  <Tooltip title="Visualizar documentos" arrow>
  <button
    type="button"
    className="icon-button detail-icon-button"
    onClick={async () => {
      const res = await listarDocumentosContrato(contratoId);
      const docs = await res.json();
      if (docs && docs.length > 0) {
        setDocsModal({ contratoId, docs });
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
                    <Tooltip title="Ver documento" arrow>
                      <button
                        type="button"
                        className="icon-button detail-icon-button"
                        aria-label="Ver documento"
                        onClick={() => void handleOpenCompanyDocument(item)}
                      >
                        <Search className="size-4" />
                      </button>
                    </Tooltip>
                    {item.id && item.status !== 'APROVADO' ? (
                      <>
                        <Tooltip title="Ações do documento" arrow>
                          <button
                            type="button"
                            className="icon-button detail-icon-button"
                            aria-label="Ações do documento"
                            disabled={validatingDocumentId === item.id}
                            onClick={() => setDocumentActionId((current) => current === item.id ? null : item.id!)}
                          >
                            <MoreVertical className="size-4" />
                          </button>
                        </Tooltip>
                        {documentActionId === item.id ? (
                          <div className="document-action-menu">
                            <button
                              type="button"
                              onClick={() => void handleValidateCompanyDocument(item)}
                              disabled={validatingDocumentId === item.id}
                            >
                              <CheckCircle className="size-4" />
                              Validar Documento
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingDocument(item);
                                setDocumentActionId(null);
                              }}
                              disabled={validatingDocumentId === item.id}
                            >
                              <XCircle className="size-4" />
                              Recusar documento
                            </button>
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
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
                  <span className="detail-table-status" data-status={item.status}>
  {item.status}
</span>
                  <Tooltip title="Baixar relatório" arrow>
                    <button type="button" className="icon-button detail-icon-button" onClick={() => setEntityActionModal({
                      title: item.title,
                      subtitle: 'Relatório pronto para download',
                      actionLabel: 'Baixar agora',
                      actionIcon: '',
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
              {canCreateCompany ? (
                <button
                  type="button"
                  className="button button--primary section-create-button"
                  onClick={() => setShowCompanyCreatePanel(true)}
                >
                  + Nova empresa
                </button>
              ) : null}
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
                    Razao social
                    <input type="text" value={companyFormName} onChange={(event) => setCompanyFormName(event.target.value)} required />
                  </label>
                  <label>
                    Nome fantasia
                    <input type="text" value={companyFormFantasyName} onChange={(event) => setCompanyFormFantasyName(event.target.value)} />
                  </label>
                  <label>
                    CNPJ
                    <input
                      type="text"
                      value={companyFormDocument}
                      onChange={(event) => setCompanyFormDocument(maskCnpj(event.target.value))}
                      maxLength={18}
                      required
                    />
                  </label>
                  <label>
                    Email de contato
                    <input type="email" value={companyFormEmail} onChange={(event) => setCompanyFormEmail(event.target.value)} required />
                  </label>
                  <label>
                    Telefone
                    <input
                      type="text"
                      value={companyFormPhone}
                      onChange={(event) => setCompanyFormPhone(maskTelefone(event.target.value))}
                      maxLength={15}
                    />
                  </label>
                  <label>
                    Nome do responsavel
                    <input type="text" value={companyFormRepresentative} onChange={(event) => setCompanyFormRepresentative(event.target.value)} />
                  </label>
                  <label>
                    CPF do responsavel
                    <input
                      type="text"
                      value={companyFormRepresentativeCpf}
                      onChange={(event) => setCompanyFormRepresentativeCpf(maskCpf(event.target.value))}
                      maxLength={14}
                    />
                  </label>
                  <label>
                    Contato do responsavel
                    <input
                      type="text"
                      value={companyFormRepresentativeContact}
                      onChange={(event) => setCompanyFormRepresentativeContact(maskTelefone(event.target.value))}
                      maxLength={15}
                    />
                  </label>
                  <label>
                    Logradouro
                    <input type="text" value={companyFormStreet} onChange={(event) => setCompanyFormStreet(event.target.value)} />
                  </label>
                  <label>
                    Numero
                    <input type="text" value={companyFormNumber} onChange={(event) => setCompanyFormNumber(event.target.value)} />
                  </label>
                  <label>
                    Bairro
                    <input type="text" value={companyFormDistrict} onChange={(event) => setCompanyFormDistrict(event.target.value)} />
                  </label>
                  <label>
                    Cidade
                    <input type="text" value={companyFormCity} onChange={(event) => setCompanyFormCity(event.target.value)} />
                  </label>
                  <label>
                    UF
                    <input
                      type="text"
                      value={companyFormUf}
                      onChange={(event) => setCompanyFormUf(event.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase())}
                      maxLength={2}
                    />
                  </label>
                  <label>
                    CEP
                    <input
                      type="text"
                      value={companyFormCep}
                      onChange={(event) => setCompanyFormCep(maskCep(event.target.value))}
                      maxLength={9}
                    />
                  </label>
                  <label>
                    Categoria
                    <input type="text" value={companyFormTags} onChange={(event) => setCompanyFormTags(event.target.value)} required />
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
{rejectingDocument && (
  <div className="dialog-backdrop" onClick={() => setRejectingDocument(null)}>
    <section className="dialog-card dialog-card--compact" onClick={(e) => e.stopPropagation()}>
      <div className="panel-header">
        <div>
          <h3>Recusar documento</h3>
          <span>{rejectingDocument.name}</span>
        </div>
        <button type="button" className="icon-button" onClick={() => setRejectingDocument(null)}>×</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {DOCUMENT_REJECTION_REASONS.map((reason) => (
          <button
            key={reason}
            type="button"
            className="proposal-rejection-option"
            disabled={validatingDocumentId === rejectingDocument.id}
            onClick={() => void handleRejectCompanyDocument(reason)}
            style={{
              textAlign: 'left',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              cursor: validatingDocumentId === rejectingDocument.id ? 'not-allowed' : 'pointer',
              width: '100%',
            }}
          >
            {reason}
          </button>
        ))}
      </div>
    </section>
  </div>
)}
{docsModal && (
  <div className="dialog-backdrop" onClick={() => setDocsModal(null)}>
    <section className="dialog-card" onClick={(e) => e.stopPropagation()}>
      <div className="panel-header">
        <div>
          <h3>Documentos do contrato</h3>
          <span>{docsModal.docs.length} documento(s) encontrado(s)</span>
        </div>
        <button type="button" className="icon-button" onClick={() => setDocsModal(null)}>✕</button>
      </div>
      <div className="detail-table-list">
        {docsModal.docs.map((doc) => (
          <article key={doc.id} className="detail-table-row" style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            onClick={async () => {
              const tab = window.open('about:blank', '_blank');
              if (tab) {
                tab.opener = null;
              }

              try {
                const dlRes = await downloadDocumentoContrato(docsModal.contratoId, doc.id);
                if (!dlRes.ok) {
                  throw new Error('Erro ao baixar documento do contrato.');
                }

                const blob = await dlRes.blob();
                const url = URL.createObjectURL(blob);
                if (tab) {
                  tab.location.href = url;
                } else {
                  window.open(url, '_blank', 'noopener,noreferrer');
                }
                setTimeout(() => URL.revokeObjectURL(url), 30000);
              } catch (error) {
                tab?.close();
                console.error('Erro ao abrir documento do contrato', error);
                alert('NÃ£o foi possÃ­vel abrir o documento deste contrato.');
              }
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <strong>{doc.nomeArquivo || `Documento ${doc.id}`}</strong>
              <small style={{ color: '#9ab0d6' }}>Clique para visualizar</small>
            </div>
            <span className="icon-button detail-icon-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⌕</span>
          </article>
        ))}
      </div>
    </section>
  </div>
)}
      <EntityActionModalData modal={entityActionModal} onClose={() => setEntityActionModal(null)} onConfirm={confirmEntityActionPreview} />
    </>
  );
}
