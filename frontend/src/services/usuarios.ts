import { API_BASE_URL, buildAuthHeaders } from './api';

export type UsuarioApiResponse = {
  id: number;
  nomeCompleto: string;
  cargo: string;
  email: string;
  cpf: string;
  telefone: string;
  ativo: boolean;
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
