import { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Search, Add as AddIcon } from '@mui/icons-material';
import type { Customer } from '../types/customer';
import { FirebaseService, TariffDocument } from '../services/firebase';

export const Stammdaten = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tariffs, setTariffs] = useState<TariffDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTariffs, setLoadingTariffs] = useState(true);
  const [newCustomerDialog, setNewCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    address: {
      street: '',
      postal_code: '',
      city: '',
      country: 'Deutschland',
    },
    hotline_password: '',
    vertragsart: 'Stromlieferung',
    status: 'aktiv',
    zaehlerstaende: [],
    ticketHistory: [],
    rechnungen: [],
    abschlag: {
      betrag: 0,
      zahlungsrhythmus: 'monatlich',
      naechsteFaelligkeit: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    },
  });
  const navigate = useNavigate();

  // Add these helper functions inside the component
  const getTariffName = (type: string): string => {
    switch (type) {
      case 'basic':
        return 'Basis Tarif';
      case 'eco':
        return 'Öko Tarif';
      case 'premium':
        return 'Premium Tarif';
      default:
        return 'Unbekannter Tarif';
    }
  };

  const getGrundpreis = (type: string): number => {
    switch (type) {
      case 'basic':
        return 8.95;
      case 'eco':
        return 10.95;
      case 'premium':
        return 12.95;
      default:
        return 8.95;
    }
  };

  const getTariffFeatures = (type: string): string[] => {
    switch (type) {
      case 'basic':
        return ['Grundversorgung', 'Online-Service'];
      case 'eco':
        return ['100% Ökostrom', 'CO2-neutral', 'Regionale Erzeugung'];
      case 'premium':
        return ['100% Ökostrom', 'Premium Support', '24/7 Service', 'Smart-Meter inklusive'];
      default:
        return [];
    }
  };

  // Fetch customers and tariffs from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingTariffs(true);
        const [fetchedCustomers, fetchedTariffs] = await Promise.all([
          FirebaseService.getAllCustomers(),
          FirebaseService.getAllTariffs()
        ]);

        console.log('Fetched tariffs:', fetchedTariffs); // Debug log

        // Validate and transform customer data
        const validCustomers = fetchedCustomers.filter(customer => {
          return customer && 
                 typeof customer === 'object' && 
                 customer.name && 
                 customer.kundennummer &&
                 customer.address &&
                 customer.tarif &&
                 customer.tarif.id &&
                 fetchedTariffs.some(t => t.id === customer.tarif.id); // Ensure tariff exists in available tariffs
        });
        
        setCustomers(validCustomers);
        
        // Validate tariffs before setting them
        const validTariffs = fetchedTariffs.filter(tariff => 
          tariff && 
          typeof tariff === 'object' && 
          tariff.id &&
          tariff.type &&
          typeof tariff.pricePerKwh === 'number'
        );

        console.log('Valid tariffs:', validTariffs); // Debug log
        setTariffs(validTariffs.map(tariff => ({
          ...tariff,
          name: getTariffName(tariff.type),
          grundpreis: getGrundpreis(tariff.type),
          arbeitspreis: tariff.pricePerKwh / 100, // Convert cents to euros
          vertragslaufzeit: '12 Monate',
          kuendigungsfrist: '6 Wochen',
          besonderheiten: getTariffFeatures(tariff.type)
        })));

        // Set default tariff for new customer if tariffs are available
        if (validTariffs.length > 0) {
          setNewCustomer(prev => ({
            ...prev,
            tarif: validTariffs[0]
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setCustomers([]);
        setTariffs([]);
      } finally {
        setLoading(false);
        setLoadingTariffs(false);
      }
    };

    fetchData();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       customer?.kundennummer?.includes(searchTerm)) ?? false
  );

  const handleRowClick = (kundennummer: string) => {
    navigate(`/stammdaten/${kundennummer}`);
  };

  const handleCreateCustomer = async () => {
    if (newCustomer.name && newCustomer.address && newCustomer.tarif?.id) {
      // Verify the selected tariff still exists
      const currentTariff = tariffs.find(t => t.id === newCustomer.tarif?.id);
      if (!currentTariff) {
        console.error('Selected tariff is no longer available');
        return;
      }

      const customerNumber = `KND${Math.random().toString(36).substr(2, 6)}`;
      const kundennummer = `43002${Math.random().toString().substr(2, 8)}`;
      const zaehlernummer = `ZN-${Math.random().toString().substr(2, 6)}`;
      const now = new Date().toISOString();
      
      const fullCustomer = {
        ...newCustomer as Customer,
        kundennummer,
        customer_number: customerNumber,
        zaehlernummer,
        vertragsnummer: `V-${Math.random().toString().substr(2, 6)}`,
        created_at: now,
        updated_at: now,
        createdAt: now,
        updatedAt: now,
        tarif: {
          ...currentTariff,
          name: getTariffName(currentTariff.type),
          grundpreis: getGrundpreis(currentTariff.type),
          arbeitspreis: currentTariff.pricePerKwh / 100,
          vertragslaufzeit: '12 Monate',
          kuendigungsfrist: '6 Wochen',
          besonderheiten: getTariffFeatures(currentTariff.type)
        },
        aiInfo: {
          lastContact: {
            date: now,
            type: 'Voicebot' as const,
            summary: 'Initial customer creation',
          },
          preferences: {
            preferredContactMethod: 'Email' as const,
            language: 'Deutsch',
          },
          history: {
            paymentHistory: {
              onTimePayments: 0,
              latePayments: 0,
              lastPaymentDate: now,
            },
            serviceHistory: {
              serviceInterruptions: 0,
            },
          },
        },
        verbrauchsanalyse: {
          jahresverbrauch: 0,
          verbrauchstrend: 'stabil' as const,
          vergleichsgruppe: {
            durchschnitt: 0,
            position: 'durchschnittlich' as const,
          },
        },
        kommunikation: {
          kommunikationshistorie: [],
        },
      };

      try {
        await FirebaseService.createCustomer(fullCustomer);
        setNewCustomerDialog(false);
        // Refresh the customer list
        const updatedCustomers = await FirebaseService.getAllCustomers();
        setCustomers(updatedCustomers.filter(customer => 
          customer && 
          typeof customer === 'object' && 
          customer.name && 
          customer.kundennummer &&
          customer.address &&
          customer.tarif &&
          customer.tarif.id
        ));
      } catch (error) {
        console.error('Error creating customer:', error);
      }
    }
  };

  if (loading || loadingTariffs) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Stammdaten
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewCustomerDialog(true)}
        >
          Neuer Kunde
        </Button>
      </Box>
      
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
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
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
                    {customer.address ? 
                      `${customer.address.street || ''}, ${customer.address.postal_code || ''} ${customer.address.city || ''}, ${customer.address.country || ''}` 
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{customer.zaehlernummer || '-'}</TableCell>
                  <TableCell>{customer.vertragsart || '-'}</TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        label={customer.status}
                        color={customer.status === 'aktiv' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {searchTerm ? 'Keine Kunden gefunden' : 'Noch keine Kunden vorhanden'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New Customer Dialog */}
      <Dialog
        open={newCustomerDialog}
        onClose={() => setNewCustomerDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Neuen Kunden anlegen</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Straße"
              value={newCustomer.address?.street}
              onChange={(e) => setNewCustomer({
                ...newCustomer,
                address: { ...newCustomer.address!, street: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="PLZ"
              value={newCustomer.address?.postal_code}
              onChange={(e) => setNewCustomer({
                ...newCustomer,
                address: { ...newCustomer.address!, postal_code: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="Stadt"
              value={newCustomer.address?.city}
              onChange={(e) => setNewCustomer({
                ...newCustomer,
                address: { ...newCustomer.address!, city: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="Hotline PIN"
              value={newCustomer.hotline_password}
              onChange={(e) => setNewCustomer({ ...newCustomer, hotline_password: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Vertragsart</InputLabel>
              <Select
                value={newCustomer.vertragsart}
                label="Vertragsart"
                onChange={(e) => setNewCustomer({ ...newCustomer, vertragsart: e.target.value })}
              >
                <MenuItem value="Stromlieferung">Stromlieferung</MenuItem>
                <MenuItem value="Gaslieferung">Gaslieferung</MenuItem>
                <MenuItem value="Kombivertrag">Kombivertrag</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Tarif</InputLabel>
              <Select
                value={newCustomer.tarif?.id || ''}
                label="Tarif"
                onChange={(e) => {
                  const selectedTariff = tariffs.find(t => t.id === e.target.value);
                  if (selectedTariff) {
                    console.log('Selected tariff:', selectedTariff); // Debug log
                    setNewCustomer({ ...newCustomer, tarif: selectedTariff });
                  }
                }}
              >
                {tariffs.length > 0 ? (
                  tariffs.map((tariff) => (
                    <MenuItem key={tariff.id} value={tariff.id}>
                      {tariff.name} - {(tariff.grundpreis || 0).toFixed(2)}€/Monat, {(tariff.arbeitspreis || 0).toFixed(4)}€/kWh
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Keine Tarife verfügbar</MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Show tariff details if one is selected */}
            {newCustomer.tarif && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Tarifdetails:</Typography>
                <Typography variant="body2">Grundpreis: {(newCustomer.tarif.grundpreis || 0).toFixed(2)}€/Monat</Typography>
                <Typography variant="body2">Arbeitspreis: {(newCustomer.tarif.arbeitspreis || 0).toFixed(4)}€/kWh</Typography>
                <Typography variant="body2">Vertragslaufzeit: {newCustomer.tarif.vertragslaufzeit || '-'}</Typography>
                <Typography variant="body2">Kündigungsfrist: {newCustomer.tarif.kuendigungsfrist || '-'}</Typography>
                {newCustomer.tarif.besonderheiten && newCustomer.tarif.besonderheiten.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {newCustomer.tarif.besonderheiten.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            )}

            <TextField
              fullWidth
              label="Abschlagsbetrag"
              type="number"
              value={newCustomer.abschlag?.betrag}
              onChange={(e) => setNewCustomer({
                ...newCustomer,
                abschlag: { ...newCustomer.abschlag!, betrag: parseFloat(e.target.value) }
              })}
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCustomerDialog(false)}>
            Abbrechen
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateCustomer}
            disabled={!newCustomer.name || !newCustomer.address?.street || !newCustomer.address?.city || !newCustomer.hotline_password || !newCustomer.tarif?.id}
          >
            Kunde anlegen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 