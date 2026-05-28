import { API_BASE_URL, buildAuthHeaders, parseApiErrorMessage } from './api';

/** Valores do enum Cargo no backend (Java) */
export type CargoApi = string;

export type UsuarioApiResponse = {
  id: number;
  nomeCompleto: string;
  cargo: string;
  email: string;
  cpf: string;
  telefone: string;
  ativo: boolean;
  situacao?: string;
  permissoes?: string[];
};

export type UsuarioCriacaoPayload = {
  nomeCompleto: string;
  cargo: CargoApi;
  permissoes: CargoApi[];
  cpf: string;
  email: string;
  telefone: string;
  senha: string;
};

export async function fetchUsuarios(): Promise<UsuarioApiResponse[]> {
  const response = await fetch(`${API_BASE_URL}/usuarios`, {
    cache: 'no-store',
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar usuarios');
  }

  return response.json();
}

/** Lista cadastros pendentes (só perfis CEO / Compliance / Conselho). Retorna `null` se 403. */
export async function fetchUsuariosPendentes(): Promise<UsuarioApiResponse[] | null> {
  const response = await fetch(`${API_BASE_URL}/usuarios/pendentes`, {
    cache: 'no-store',
    headers: buildAuthHeaders(),
  });

  if (response.status === 403) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(parseApiErrorMessage(text, response.status) || 'Erro ao carregar cadastros pendentes');
  }

  return response.json();
}

export async function aprovarUsuario(id: number): Promise<UsuarioApiResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/usuarios/${id}/aprovar`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        ...buildAuthHeaders(true),
        Accept: 'application/json',
      },
      body: '{}',
    });
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    if (m.toLowerCase().includes('failed to fetch') || m.toLowerCase().includes('network')) {
      throw new Error(
        `Não foi possível conectar à API (${API_BASE_URL}). Verifique se o back-end está rodando e o .env do front.`
      );
    }
    throw err instanceof Error ? err : new Error('Erro de rede ao aprovar.');
  }

  const text = await response.text();
  if (!response.ok) {
    const detail = parseApiErrorMessage(text, response.status) || 'Erro ao aprovar cadastro';
    throw new Error(response.status ? `${detail} (${response.status})` : detail);
  }

  if (!text || !text.trim()) {
    return {} as UsuarioApiResponse;
  }

  try {
    return JSON.parse(text) as UsuarioApiResponse;
  } catch {
    throw new Error('Resposta inválida do servidor ao aprovar.');
  }
}

export async function createUsuario(payload: UsuarioCriacaoPayload): Promise<UsuarioApiResponse> {
  const response = await fetch(`${API_BASE_URL}/usuarios`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Erro ao cadastrar usuário (${response.status})`);
  }

  return text ? (JSON.parse(text) as UsuarioApiResponse) : ({} as UsuarioApiResponse);
}
