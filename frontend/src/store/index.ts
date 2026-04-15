import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profileSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;