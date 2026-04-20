import { API_BASE_URL } from './api';

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
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao autenticar');
  }

  return response.json();
}

export async function forgotPassword(email: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const message = await response.text();
  if (!response.ok) {
    throw new Error(message || 'Falha ao solicitar recuperação de senha');
  }

  return message;
}

export async function resetPassword(token: string, novaSenha: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, novaSenha }),
  });

  const message = await response.text();
  if (!response.ok) {
    throw new Error(message || 'Falha ao redefinir senha');
  }

  return message;
}
