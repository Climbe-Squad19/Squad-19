import { API_BASE_URL, buildAuthHeaders, parseApiErrorMessage } from './api';

export type InternalNotificationApiResponse = {
  id: number;
  mensagem: string;
  lida: boolean;
  criadaEm: string;
};

export async function fetchInternalNotifications(): Promise<InternalNotificationApiResponse[]> {
  const response = await fetch(`${API_BASE_URL}/notificacoes/internas`, {
    headers: buildAuthHeaders(false),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(parseApiErrorMessage(text, response.status) || 'Erro ao carregar notificacoes.');
  }

  return response.json() as Promise<InternalNotificationApiResponse[]>;
}
