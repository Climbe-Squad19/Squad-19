import { API_BASE_URL } from './api';
import type { PropostaApiResponse, ReuniaoApiResponse, DocumentoApiResponse } from './business';

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

export function updatePortalPropostaStatus(
  propostaId: number,
  status: 'ACEITA' | 'RECUSADA'
): Promise<PropostaApiResponse> {
  const motivoParam = status === 'RECUSADA' ? '&motivoRecusa=Recusado pelo contratante' : '';
  return fetch(`${API_BASE_URL}/propostas/${propostaId}/status?status=${encodeURIComponent(status)}${motivoParam}`, {
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

export function uploadPortalDocumento(
  empresaId: number,
  tipoDocumento: string,
  arquivo: File
): Promise<DocumentoApiResponse> {
  const formData = new FormData();
  formData.append('arquivo', arquivo);
  formData.append('empresaId', String(empresaId));
  formData.append('tipoDocumento', tipoDocumento);

  return fetch(`${API_BASE_URL}/documentos/empresa`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getPortalToken() ?? ''}`,
    },
    body: formData,
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao enviar o documento');
    }
    return response.json() as Promise<DocumentoApiResponse>;
  });
}