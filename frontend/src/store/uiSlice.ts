import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ActiveMenuItem =
  | 'Dashboard'
  | 'Agenda'
  | 'Propostas comerciais'
  | 'Clientes / Empresas'
  | 'Equipe'
  | 'Configurações'
  | 'Perfil';

export type ExpandedSection = 'agenda' | 'contracts' | 'dueDates' | null;

interface UiState {
  activeMenuItem: ActiveMenuItem;
  expandedSection: ExpandedSection;
  showNotifications: boolean;
  notificationMessage: string;
}

const initialState: UiState = {
  activeMenuItem: 'Dashboard',
  expandedSection: null,
  showNotifications: false,
  notificationMessage: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveMenuItem(state, action: PayloadAction<ActiveMenuItem>) {
      state.activeMenuItem = action.payload;
    },
    toggleExpandedSection(state, action: PayloadAction<Exclude<ExpandedSection, null>>) {
      state.expandedSection = state.expandedSection === action.payload ? null : action.payload;
    },
    openNotifications(state, action: PayloadAction<string>) {
      state.showNotifications = true;
      state.notificationMessage = action.payload;
    },
    closeNotifications(state) {
      state.showNotifications = false;
      state.notificationMessage = '';
    },
  },
});

export const { setActiveMenuItem, toggleExpandedSection, openNotifications, closeNotifications } = uiSlice.actions;
export default uiSlice.reducer;