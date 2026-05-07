import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  showNotifications: boolean;
  notificationMessage: string;
}

const initialState: UiState = {
  showNotifications: false,
  notificationMessage: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
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

export const { openNotifications, closeNotifications } = uiSlice.actions;
export default uiSlice.reducer;
