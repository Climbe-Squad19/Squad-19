import { API_BASE_URL, buildAuthHeaders } from './api';

export type IntegracoesResponse = {
  googleDrive: boolean;
  googleCalendar: boolean;
  googleSheets: boolean;
  gmail: boolean;
};

export type IntegracaoKey = keyof IntegracoesResponse;

export async function fetchMinhasIntegracoes(): Promise<IntegracoesResponse> {
  const response = await fetch(`${API_BASE_URL}/integracoes/me`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar integrações');
  }

  return response.json();
}

export async function updateIntegracao(integracao: IntegracaoKey, conectado: boolean): Promise<IntegracoesResponse> {
  const response = await fetch(`${API_BASE_URL}/integracoes/me`, {
    method: 'PATCH',
    headers: buildAuthHeaders(),
    body: JSON.stringify({ integracao, conectado }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Erro ao atualizar integração');
  }

  return response.json();
}

export async function getGoogleIntegrationAuthUrl(integracao: IntegracaoKey): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/integracoes/google/authorize?provider=${encodeURIComponent(integracao)}`, {
    headers: buildAuthHeaders(false),
  });

  if (!response.ok) {
    const raw = await response.text();
    let message = 'Erro ao iniciar autenticação Google';
    try {
      const parsed = JSON.parse(raw) as { authUrl?: string; message?: string };
      if (parsed.message) {
        message = parsed.message;
      } else if (parsed.authUrl) {
        // legado: erro antigo vinha no campo authUrl
        message = parsed.authUrl.startsWith('http') ? message : parsed.authUrl;
      }
    } catch {
      message = raw || message;
    }
    throw new Error(message);
  }

  const data = await response.json() as { authUrl: string };
  return data.authUrl;
}
