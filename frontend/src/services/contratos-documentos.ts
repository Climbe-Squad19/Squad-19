import { API_BASE_URL, ACCESS_TOKEN_KEY } from './api';

export const uploadDocumentoContrato = async (
  contratoId: number,
  usuarioId: number,
  arquivo: File
) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const form = new FormData();
  form.append('usuarioId', String(usuarioId));
  form.append('arquivo', arquivo);

  return fetch(`${API_BASE_URL}/contratos/${contratoId}/documentos/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
};

export const listarDocumentosContrato = async (contratoId: number) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return fetch(`${API_BASE_URL}/contratos/${contratoId}/documentos`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const downloadDocumentoContrato = async (contratoId: number, id: number) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return fetch(`${API_BASE_URL}/contratos/${contratoId}/documentos/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};