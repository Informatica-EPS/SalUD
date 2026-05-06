import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
   palette: {
      primary: {
         main: '#1976d2',
         light: '#42a5f5',
         dark: '#1565c0',
         contrastText: '#fff',
      },
      secondary: {
         main: '#dc004e',
         light: '#f50057',
         dark: '#c51162',
         contrastText: '#fff',
      },
      background: {
         default: '#f5f5f5',
         paper: '#ffffff',
      },
   },
   typography: {
      fontFamily: [
         'Inter',
         'system-ui',
         '-apple-system',
         'BlinkMacSystemFont',
         'Segoe UI',
         'Roboto',
         'Arial',
         'sans-serif',
      ].join(','),
      h4: {
         fontWeight: 600,
      },
      h5: {
         fontWeight: 600,
      },
   },
   components: {
      MuiButton: {
         styleOverrides: {
            root: {
               textTransform: 'none',
               borderRadius: 8,
            },
         },
      },
      MuiCard: {
         styleOverrides: {
            root: {
               borderRadius: 12,
            },
         },
      },
   },
});

export default theme;
