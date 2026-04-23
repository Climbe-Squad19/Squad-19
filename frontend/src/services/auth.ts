import type { ProfileState } from '../store/profileSlice';
import { formatCargoDisplay, normalizeCargoFromApi } from '../utils/cargo';
import { API_BASE_URL, buildAuthHeaders } from './api';
import type { UsuarioApiResponse } from './usuarios';

/** Indica se a API tem GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET configurados. */
export async function fetchGoogleOAuthDisponivel(): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE_URL}/auth/google/disponivel`);
    if (!r.ok) return false;
    const d = (await r.json()) as { disponivel?: boolean };
    return d.disponivel === true;
  } catch {
    return false;
  }
}

function fetchErrorMessage(error: unknown, endpoint: string, baseUrl: string): string {
  if (error instanceof TypeError) {
    const m = (error.message || '').toLowerCase();
    if (m.includes('load failed') || m.includes('failed to fetch') || m.includes('network')) {
      return (
        `Não foi possível conectar à API (${endpoint}). ` +
        `Suba o back-end (ex.: cd gestao-contratos && mvn spring-boot:run) e confira se a porta no ` +
        `browser bate com VITE_API_BASE_URL (agora: ${baseUrl}). Reinicie o Vite após mudar o .env.`
      );
    }
  }
  return error instanceof Error ? error.message : 'Erro de rede.';
}

export type LoginRequest = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
};

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const url = `${API_BASE_URL}/auth/login`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  } catch (error) {
    throw new Error(fetchErrorMessage(error, url, API_BASE_URL));
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao autenticar');
  }

  return response.json();
}

export async function forgotPassword(email: string): Promise<string> {
  const url = `${API_BASE_URL}/auth/forgot-password`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  } catch (error) {
    throw new Error(fetchErrorMessage(error, url, API_BASE_URL));
  }

  const message = await response.text();
  if (!response.ok) {
    throw new Error(message || 'Falha ao solicitar recuperação de senha');
  }

  return message;
}

export async function resetPassword(token: string, novaSenha: string): Promise<string> {
  const url = `${API_BASE_URL}/auth/reset-password`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, novaSenha }),
    });
  } catch (error) {
    throw new Error(fetchErrorMessage(error, url, API_BASE_URL));
  }

  const message = await response.text();
  if (!response.ok) {
    throw new Error(message || 'Falha ao redefinir senha');
  }

  return message;
}

export type AuthMeResponse = {
  usuario: UsuarioApiResponse;
  podeGerenciarCadastros: boolean;
};

/** Monta o estado do Redux a partir do GET /auth/me (cargo e permissão de aprovação reais). */
export function profileFromAuthMe(data: AuthMeResponse): ProfileState {
  const u = data.usuario;
  return {
    fullName: u.nomeCompleto,
    email: u.email,
    role: formatCargoDisplay(normalizeCargoFromApi(u.cargo)),
    phone: u.telefone || '',
    documentType: 'CPF',
    documentNumber: '***',
    company: 'Climb Consultoria',
    status: u.ativo ? 'Online' : 'Offline',
    podeGerenciarCadastros: data.podeGerenciarCadastros,
  };
}

export async function fetchAuthMe(): Promise<AuthMeResponse> {
  const r = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: buildAuthHeaders(false),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || 'Não foi possível carregar a sessão.');
  }
  return r.json();
}
