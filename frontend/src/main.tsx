import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
// import App from './app/App';
import { App } from './App'
import theme from './theme';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* <CssBaseline /> */}
    <App />
    <ThemeProvider theme={theme}>
    </ThemeProvider>
  </React.StrictMode>
);