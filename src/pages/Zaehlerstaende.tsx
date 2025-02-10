import { useState } from 'react';
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
  Chip,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import type { Customer, MeterReading } from '../types/customer';

export const Zaehlerstaende = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with Firebase data
  const meterReadings: (MeterReading & { kundennummer: string; name: string })[] = [
    {
      kundennummer: '4300210000552',
      name: 'Kim Reiter',
      datum: '2023-11-10',
      stand: 45678,
      einheit: 'kWh',
      erfassungsart: 'voicebot',
    },
    {
      kundennummer: '4300210000552',
      name: 'Kim Reiter',
      datum: '2023-10-10',
      stand: 45123,
      einheit: 'kWh',
      erfassungsart: 'manuell',
    },
  ];

  const filteredReadings = meterReadings.filter(
    (reading) =>
      reading.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.kundennummer.includes(searchTerm)
  );

  const getChipColor = (erfassungsart: string) => {
    switch (erfassungsart) {
      case 'voicebot':
        return 'primary';
      case 'automatisch':
        return 'success';
      case 'manuell':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Zählerstände
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
              <TableCell>Datum</TableCell>
              <TableCell>Zählerstand</TableCell>
              <TableCell>Einheit</TableCell>
              <TableCell>Erfassungsart</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReadings.map((reading, index) => (
              <TableRow key={`${reading.kundennummer}-${reading.datum}`}>
                <TableCell>{reading.kundennummer}</TableCell>
                <TableCell>{reading.name}</TableCell>
                <TableCell>{new Date(reading.datum).toLocaleDateString('de-DE')}</TableCell>
                <TableCell>{reading.stand.toLocaleString('de-DE')}</TableCell>
                <TableCell>{reading.einheit}</TableCell>
                <TableCell>
                  <Chip
                    label={reading.erfassungsart}
                    color={getChipColor(reading.erfassungsart)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}; 