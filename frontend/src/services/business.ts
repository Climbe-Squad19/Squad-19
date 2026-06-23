import { API_BASE_URL, buildAuthHeaders, parseApiErrorMessage } from './api';

export type PropostaApiResponse = {
  id: number;
  empresaId: number;
  nomeEmpresa: string;
  criadoPorId?: number | null;
  nomeCriadoPor?: string | null;
  servicoContratado: string;
  valorMensal?: number | null;
  status: string;
  dataCriacao: string;
  motivoRecusa?: string | null;
  motivoDaRecusa?: string | null;
  justificativaRecusa?: string | null;
  linkGoogleDrive?: string | null;
};

export type ContratoApiResponse = {
  id: number;
  empresaId: number;
  nomeEmpresa: string;
  tipoServico: string;
  status: string;
  dataInicio: string;
};

export type DocumentoApiResponse = {
  id: number;
  empresaId: number;
  nomeArquivo: string;
  tipo: string;
  status: string;
  motivoRejeicao?: string | null;
  s3Url?: string | null;
  googleDriveWebViewLink?: string | null;
};

export type ReuniaoApiResponse = {
  id: number;
  empresaId: number;
  pauta: string;
  dataHora: string;
  presencial: boolean;
  sala: string;
  linkOnline: string;
};

export type PropostaCriacaoPayload = {
  empresaId: number;
  servicoContratado: string;
  valorMensal?: number | null;
  valorSetup?: number;
  dataEmissao?: string;
  linkGoogleDrive?: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: buildAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Erro na API: ${url}`);
  }
  return response.json();
}

export function fetchPropostas(): Promise<PropostaApiResponse[]> {
  return fetchJson(`${API_BASE_URL}/propostas`);
}

export function fetchContratos(): Promise<ContratoApiResponse[]> {
  return fetchJson(`${API_BASE_URL}/contratos`);
}

export function fetchReunioes(): Promise<ReuniaoApiResponse[]> {
  return fetchJson(`${API_BASE_URL}/reunioes`);
}

export function fetchDocumentosByEmpresa(empresaId: number): Promise<DocumentoApiResponse[]> {
  return fetchJson(`${API_BASE_URL}/documentos/empresa/${empresaId}`);
}

export async function downloadDocumentoEmpresa(documentoId: number): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/documentos/${encodeURIComponent(String(documentoId))}/download`, {
    headers: buildAuthHeaders(false),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Erro ao abrir documento');
  }
  return response.blob();
}

export async function validarDocumentoEmpresa(
  documentoId: number,
  analistaId: number,
  aprovado: boolean,
  motivoRejeicao?: string
): Promise<DocumentoApiResponse> {
  const params = new URLSearchParams({
    analistaId: String(analistaId),
    aprovado: String(aprovado),
  });
  if (!aprovado && motivoRejeicao) {
    params.append('motivoRejeicao', motivoRejeicao);
  }

  const response = await fetch(`${API_BASE_URL}/documentos/${documentoId}/validar?${params.toString()}`, {
    method: 'POST',
    headers: buildAuthHeaders(false),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(parseApiErrorMessage(text, response.status) || 'Erro ao validar documento');
  }
  return response.json();
}

export async function criarProposta(payload: PropostaCriacaoPayload): Promise<PropostaApiResponse> {
  const response = await fetch(`${API_BASE_URL}/propostas`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Erro ao criar proposta');
  }
  return response.json();
}

export async function atualizarStatusProposta(
  propostaId: number,
  status: 'ACEITA' | 'RECUSADA'| 'ENVIADA',
  motivoRecusa?: string
): Promise<PropostaApiResponse> {
  const params = new URLSearchParams({ status });
  if (motivoRecusa) {
    params.append('motivoRecusa', motivoRecusa);
  }
  const response = await fetch(
    `${API_BASE_URL}/propostas/${propostaId}/status?${params.toString()}`,
    { method: 'PUT', headers: buildAuthHeaders(false) }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erro ao atualizar status da proposta`);
  }
  return response.json();
}
