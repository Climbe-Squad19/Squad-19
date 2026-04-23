export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081';

export const ACCESS_TOKEN_KEY = 'climbe_access_token';

/**
 * Corpo de erro da API (Spring Boot 3 / RFC 7807 usa `detail`; respostas antigas usam `message`).
 * @param httpStatus quando o corpo vem vazio (ex.: 403 do proxy), usa mensagem útil em PT.
 */
export function parseApiErrorMessage(text: string, httpStatus?: number): string {
  const raw = text.trim();
  if (!raw) {
    if (httpStatus === 403) {
      return 'Acesso negado. Apenas CEO, Compliance ou Membro do Conselho podem aprovar cadastros. Confira o cargo no banco de dados e faça login de novo.';
    }
    if (httpStatus === 401) {
      return 'Sessão expirada ou não autenticado. Faça login novamente.';
    }
    return 'Erro desconhecido.';
  }
  try {
    const j = JSON.parse(raw) as Record<string, unknown>;
    const detail = typeof j.detail === 'string' ? j.detail : '';
    const message = typeof j.message === 'string' ? j.message : '';
    const error = typeof j.error === 'string' ? j.error : '';
    if (detail) {
      return detail;
    }
    if (message) {
      return message;
    }
    if (error) {
      return error;
    }
  } catch {
    /* texto plano ou HTML */
  }
  if (raw.length > 400 && (raw.includes('<!DOCTYPE') || raw.includes('<html'))) {
    return 'Resposta inesperada do servidor (HTML). Confira VITE_API_BASE_URL e se a API está no ar.';
  }
  return raw;
}

export function buildAuthHeaders(includeJsonContentType = true): HeadersInit {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const headers: HeadersInit = {};

  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
