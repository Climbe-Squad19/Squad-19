import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DocumentType = 'CPF' | 'CNPJ';

export interface ProfileState {
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
  fullName: 'Marcos Paulo',
  email: 'marcos.paulo@climb.com.br',
  role: 'Administrador',
  phone: '(79) 99999-1234',
  documentType: 'CPF',
  documentNumber: '123.456.789-00',
  company: 'Climb Consultoria',
  status: 'Online',
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