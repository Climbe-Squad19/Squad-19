import { API_BASE_URL, buildAuthHeaders } from './api';

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
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar usuarios');
  }

  return response.json();
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
