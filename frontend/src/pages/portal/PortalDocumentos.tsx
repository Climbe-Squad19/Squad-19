import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';
import { Tooltip } from '@mui/material';
import { downloadPortalDocumento, fetchPortalDocumentos, uploadPortalDocumento, getPortalEmpresaId } from '../../services/portal';
import type { DocumentoApiResponse } from '../../services/business';

const documentTypes = [
  'BALANCO_EMPRESA',
  'DRE',
  'CNPJ',
  'CONTRATO_SOCIAL',
  'PLANILHA_GERENCIAL',
] as const;

export default function PortalDocumentosPage() {
  const [documentos, setDocumentos] = useState<DocumentoApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<typeof documentTypes[number]>('BALANCO_EMPRESA');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const empresaId = getPortalEmpresaId();

  useEffect(() => {
    if (!empresaId) {
      setLoading(false);
      return;
    }

    fetchPortalDocumentos(empresaId)
      .then(setDocumentos)
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Erro ao carregar documentos'))
      .finally(() => setLoading(false));
  }, [empresaId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!empresaId || !file) {
      toast.error('Selecione um arquivo antes de enviar.');
      return;
    }

    setUploading(true);
    try {
      await uploadPortalDocumento(empresaId, selectedType, file);
      const updated = await fetchPortalDocumentos(empresaId);
      setDocumentos(updated);
      setFile(null);
      toast.success('Documento enviado com sucesso.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  }

  async function handleOpenDocumento(documento: DocumentoApiResponse) {
    const directUrl = documento.googleDriveWebViewLink || documento.s3Url;
    if (directUrl) {
      window.open(directUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      const blob = await downloadPortalDocumento(documento.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao abrir documento');
    }
  }

  return (
    <div className="panel stacked-panel">
      <div className="section-topbar">
        <div>
          <h3>Documentos</h3>
          <span>Envie arquivos e acompanhe o status</span>
        </div>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit} className="portal-upload-form grid gap-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="portal-field flex flex-col gap-2 text-sm font-semibold">
              Tipo de documento
              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value as typeof documentTypes[number])}
                className="portal-control rounded-md px-3 py-2 text-sm outline-none"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="portal-field flex flex-col gap-2 text-sm font-semibold">
              Arquivo
              <input
                type="file"
                accept="*/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="portal-control portal-file-input rounded-md px-3 py-2 text-sm outline-none"
              />
            </label>
          </div>

          <button type="submit" disabled={uploading} className="button button--primary w-fit">
            {uploading ? 'Enviando...' : 'Enviar documento'}
          </button>
        </form>

        {loading ? (
          <div className="p-6 text-zinc-400">Carregando documentos...</div>
        ) : documentos.length === 0 ? (
          <div className="p-6 text-zinc-400 text-center">Nenhum documento encontrado.</div>
        ) : (
          <div className="detail-table-list">
            {documentos.map((documento) => (
              <article key={documento.id} className="detail-table-row">
                <div>
                  <strong>{documento.nomeArquivo || 'Sem nome'}</strong>
                  <small className="text-zinc-400">Arquivo</small>
                </div>
                <div>
                  <strong>{documento.tipo}</strong>
                  <small className="text-zinc-400">Tipo</small>
                </div>
                <div>
                  <span className="detail-table-status" data-status={documento.status}>
                    {documento.status}
                  </span>
                </div>
                <Tooltip title="Ver documento anexado" arrow>
                  <button
                    type="button"
                    className="icon-button detail-icon-button"
                    onClick={() => void handleOpenDocumento(documento)}
                  >
                    <Eye className="size-4" />
                  </button>
                </Tooltip>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
