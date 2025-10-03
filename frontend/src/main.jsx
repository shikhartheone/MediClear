// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// --- THE FINAL "PLUM VIBE" LIGHT THEME ---
const plumLightTheme = createTheme({
  palette: {
    mode: 'light', // The key change to enable light mode
    primary: {
      main: '#6a45d1', // Plum's primary purple
    },
    background: {
      default: '#f9f9f9', // Plum's light gray background
      paper: '#ffffff',   // White for cards and surfaces
    },
    text: {
      primary: '#1a1a1a', // Dark charcoal for text
      secondary: '#5b5b5b', // Lighter gray for subtitles
    },
  },
  typography: {
    // Keep the professional font pairing
    fontFamily: 'Inter, sans-serif',
    h1: { fontFamily: 'Lora, serif', fontWeight: 700 },
    h2: { fontFamily: 'Lora, serif', fontWeight: 700 },
    h3: { fontFamily: 'Lora, serif', fontWeight: 700 },
    h4: { fontFamily: 'Lora, serif', fontWeight: 700 },
    h5: { fontFamily: 'Lora, serif', fontWeight: 700 },
    h6: { fontFamily: 'Lora, serif', fontWeight: 700 },
  },
  components: {
    // Component shape overrides remain the same
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bold',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={plumLightTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);