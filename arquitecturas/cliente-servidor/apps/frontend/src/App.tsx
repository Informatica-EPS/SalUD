import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context';
import AppRoutes from './routes';

// Crear tema personalizado
const theme = createTheme({
   palette: {
      primary: {
         main: '#1976d2',
      },
      secondary: {
         main: '#dc004e',
      },
   },
});

function App() {
   return (
      <ThemeProvider theme={theme}>
         <CssBaseline />
         <AuthProvider>
            <AppRoutes />
         </AuthProvider>
      </ThemeProvider>
   );
}

export default App;
