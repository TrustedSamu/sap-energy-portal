import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import type { Customer } from '../types/customer';

export const Stammdaten = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Mock data - replace with Firebase data
  const customers: Customer[] = [
    {
      kundennummer: '4300210000552',
      name: 'Max Mustermann',
      adresse: {
        strasse: 'Musterstraße',
        hausnummer: '123',
        plz: '48155',
        ort: 'Münster',
      },
      zaehlernummer: 'ZN-987654',
      zaehlerstaende: [],
      vertragsnummer: 'V-123456',
      vertragsart: 'Stromlieferung',
      status: 'aktiv',
    },
    {
      kundennummer: '4300210000553',
      name: 'Kim Reiter',
      adresse: {
        strasse: 'Am Mittelhafen',
        hausnummer: '369',
        plz: '48155',
        ort: 'Münster',
      },
      zaehlernummer: 'ZN-123456',
      zaehlerstaende: [],
      vertragsnummer: 'V-987654',
      vertragsart: 'Stromlieferung',
      status: 'aktiv',
    },
  ];

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.kundennummer.includes(searchTerm)
  );

  const handleRowClick = (kundennummer: string) => {
    navigate(`/stammdaten/${kundennummer}`);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Stammdaten
      </Typography>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Suche nach Kundenname oder Kundennummer..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kundennummer</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Zählernummer</TableCell>
              <TableCell>Vertragsart</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow
                key={customer.kundennummer}
                onClick={() => handleRowClick(customer.kundennummer)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <TableCell>{customer.kundennummer}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>
                  {`${customer.adresse.strasse} ${customer.adresse.hausnummer}, ${customer.adresse.plz} ${customer.adresse.ort}`}
                </TableCell>
                <TableCell>{customer.zaehlernummer}</TableCell>
                <TableCell>{customer.vertragsart}</TableCell>
                <TableCell>{customer.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}; 