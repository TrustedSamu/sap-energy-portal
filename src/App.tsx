import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Stammdaten } from './pages/Stammdaten';
import { Zaehlerstaende } from './pages/Zaehlerstaende';
import { Einstellungen } from './pages/Einstellungen';
import { KundenDetail } from './pages/KundenDetail';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#003366', // SAP-like blue
    },
    secondary: {
      main: '#1c86ee', // Lighter blue for secondary actions
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stammdaten" element={<Stammdaten />} />
            <Route path="/stammdaten/:kundennummer" element={<KundenDetail />} />
            <Route path="/zaehlerstaende" element={<Zaehlerstaende />} />
            <Route path="/einstellungen" element={<Einstellungen />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
