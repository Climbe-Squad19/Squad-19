import { API_BASE_URL, parseApiErrorMessage } from './api';
import type { PropostaApiResponse, ReuniaoApiResponse, DocumentoApiResponse, PropostaCriacaoPayload } from './business';

export const PORTAL_TOKEN_KEY = 'climbe_portal_token';
export const PORTAL_EMPRESA_KEY = 'climbe_portal_empresa';

export type PortalLoginRequest = {
  email: string;
  cnpj: string;
};

export type PortalLoginResponse = {
  accessToken: string;
  token?: string;
  tokenType?: string;
  expiresIn?: number;
  [key: string]: unknown;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function portalLogin(request: PortalLoginRequest): Promise<PortalLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/portal-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Falha ao autenticar o portal');
  }

  return response.json() as Promise<PortalLoginResponse>;
}

function buildPortalAuthHeaders(includeJsonContentType = true): HeadersInit {
  const token = getPortalToken();
  const headers: HeadersInit = {};

  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getPortalApiJson<T>(url: string): Promise<T> {
  return fetch(url, {
    headers: buildPortalAuthHeaders(),
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Erro na API: ${url}`);
    }
    return response.json() as Promise<T>;
  });
}

export function getPortalToken(): string | null {
  return localStorage.getItem(PORTAL_TOKEN_KEY);
}

export function savePortalToken(token: string) {
  localStorage.setItem(PORTAL_TOKEN_KEY, token);
}

export function getPortalEmpresa() {
  const raw = localStorage.getItem(PORTAL_EMPRESA_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function savePortalEmpresa(empresa: unknown) {
  localStorage.setItem(PORTAL_EMPRESA_KEY, JSON.stringify(empresa));
}

export function clearPortalSession() {
  localStorage.removeItem(PORTAL_TOKEN_KEY);
  localStorage.removeItem(PORTAL_EMPRESA_KEY);
}

export function getPortalEmpresaId(): number | undefined {
  // Extrai empresaId direto do JWT (campo "id" nas claims)
  const token = getPortalToken();
  if (!token) return undefined;
  const payload = decodeJwtPayload(token);
  if (!payload) return undefined;
  const id = payload['id'];
  if (typeof id === 'number') return id;
  if (typeof id === 'string') {
    const parsed = Number(id);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

export function fetchPortalPropostas(empresaId: number): Promise<PropostaApiResponse[]> {
  return getPortalApiJson(`${API_BASE_URL}/propostas?empresaId=${encodeURIComponent(String(empresaId))}`);
}

export function criarPortalProposta(empresaId: number, payload: Omit<PropostaCriacaoPayload, 'empresaId'>): Promise<PropostaApiResponse> {
  return fetch(`${API_BASE_URL}/propostas/portal?empresaId=${encodeURIComponent(String(empresaId))}`, {
    method: 'POST',
    headers: buildPortalAuthHeaders(),
    body: JSON.stringify({ ...payload, empresaId }),
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao enviar proposta');
    }
    return response.json() as Promise<PropostaApiResponse>;
  });
}

export function updatePortalPropostaStatus(
  empresaId: number,
  propostaId: number,
  status: 'ACEITA' | 'RECUSADA',
  motivoRecusa?: string
): Promise<PropostaApiResponse> {
  const params = new URLSearchParams({ status });
  if (status === 'RECUSADA') {
    params.append('motivoRecusa', motivoRecusa || 'Recusado pelo contratante');
  }
  return fetch(`${API_BASE_URL}/propostas/portal/${propostaId}/status?empresaId=${encodeURIComponent(String(empresaId))}&${params.toString()}`, {
    method: 'PUT',
    headers: buildPortalAuthHeaders(false),
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao atualizar o status da proposta');
    }
    return response.json() as Promise<PropostaApiResponse>;
  });
}

export function fetchPortalReunioes(empresaId: number): Promise<ReuniaoApiResponse[]> {
  return getPortalApiJson(`${API_BASE_URL}/reunioes?empresaId=${encodeURIComponent(String(empresaId))}`);
}

export function fetchPortalDocumentos(empresaId: number): Promise<DocumentoApiResponse[]> {
  return getPortalApiJson(`${API_BASE_URL}/documentos/empresa/${encodeURIComponent(String(empresaId))}`);
}

export function downloadPortalDocumento(documentoId: number): Promise<Blob> {
  return fetch(`${API_BASE_URL}/documentos/${encodeURIComponent(String(documentoId))}/download`, {
    headers: buildPortalAuthHeaders(false),
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao abrir documento');
    }
    return response.blob();
  });
}

export function uploadPortalDocumento(
  empresaId: number,
  tipoDocumento: string,
  arquivo: File
): Promise<DocumentoApiResponse> {
  const formData = new FormData();
  formData.append('arquivo', arquivo);
  formData.append('empresaId', String(empresaId));
  formData.append('tipo', tipoDocumento);

  return fetch(`${API_BASE_URL}/documentos/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getPortalToken() ?? ''}`,
    },
    body: formData,
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(parseApiErrorMessage(text, response.status) || 'Erro ao enviar o documento');
    }
    return response.json() as Promise<DocumentoApiResponse>;
  });
}
