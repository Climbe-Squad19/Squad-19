import { API_BASE_URL } from './api';
import type { PropostaApiResponse, ReuniaoApiResponse, DocumentoApiResponse } from './business';

export const PORTAL_TOKEN_KEY = 'climbe_portal_token';
export const PORTAL_EMPRESA_KEY = 'climbe_portal_empresa';

export type PortalLoginRequest = {
  email: string;
  senha: string;
};

export type PortalLoginResponse = {
  accessToken: string;
  token?: string;
  tokenType?: string;
  expiresIn?: number;
  [key: string]: unknown;
};

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

export async function fetchPortalMe(token: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Falha ao carregar dados do usuário');
  }

  return response.json() as Promise<Record<string, unknown>>;
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
  const empresa = getPortalEmpresa();
  if (!empresa || typeof empresa !== 'object') {
    return undefined;
  }

  const maybe = empresa as Record<string, unknown>;
  const nestedEmpresa = maybe.empresa;
  const nestedEmpresaId =
    nestedEmpresa && typeof nestedEmpresa === 'object'
      ? (nestedEmpresa as Record<string, unknown>).id
      : undefined;

  const fromRootId = maybe.empresaId ?? maybe.id ?? nestedEmpresaId;
  if (typeof fromRootId === 'number') {
    return fromRootId;
  }
  if (typeof fromRootId === 'string' && fromRootId.trim()) {
    const parsed = Number(fromRootId);
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
  return fetch(`${API_BASE_URL}/propostas/${propostaId}/status?status=${encodeURIComponent(status)}`, {
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
