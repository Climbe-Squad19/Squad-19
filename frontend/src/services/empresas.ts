import { API_BASE_URL, buildAuthHeaders } from './api';

export type EmpresaApiResponse = {
  id: number;
  razaoSocial: string;
  cnpj: string;
  ativa: boolean;
  dataCadastro: string;
};

export type EmpresaCreatePayload = {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone: string;
  emailContato: string;
  nomeRepresentante: string;
  cpfRepresentante: string;
  contatoRepresentante: string;
};

export async function fetchEmpresas(): Promise<EmpresaApiResponse[]> {
  const response = await fetch(`${API_BASE_URL}/empresas`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar empresas');
  }

  return response.json();
}

export async function createEmpresa(payload: EmpresaCreatePayload): Promise<EmpresaApiResponse> {
  const response = await fetch(`${API_BASE_URL}/empresas`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Erro ao criar empresa');
  }

  return response.json();
}
