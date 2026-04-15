import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4cc9f0',
    },
    secondary: {
      main: '#66f7d9',
    },
    background: {
      default: '#05080d',
      paper: '#0b1220',
    },
    text: {
      primary: '#edf2f7',
      secondary: '#9ab0d6',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
});

export default theme;