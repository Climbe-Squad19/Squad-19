import { API_BASE_URL, buildAuthHeaders } from './api';

export type PropostaApiResponse = {
  id: number;
  empresaId: number;
  nomeEmpresa: string;
  servicoContratado: string;
  valorMensal: number;
  status: string;
  dataCriacao: string;
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
