import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DocumentType = 'CPF' | 'CNPJ';

export interface ProfileState {
  id?: number;
  fullName: string;
  email: string;
  role: string;
  phone: string;
  documentType: DocumentType;
  documentNumber: string;
  company: string;
  status: 'Online' | 'Em reunião' | 'Offline';
  /** Vem do GET /auth/me — CEO, Compliance ou Membro do Conselho. */
  podeGerenciarCadastros: boolean;
}

const initialState: ProfileState = {
  fullName: 'Usuário',
  email: '',
  role: '',
  phone: '',
  documentType: 'CPF',
  documentNumber: '',
  company: '',
  status: 'Offline',
  podeGerenciarCadastros: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile(state, action: PayloadAction<ProfileState>) {
      return action.payload;
    },
  },
});

export const { updateProfile } = profileSlice.actions;
export default profileSlice.reducer;