import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  SelectChangeEvent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  ExpandLess,
  ExpandMore,
  Person,
  Assignment,
  Speed,
  History,
  ArrowBack,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  SmartToy as VoicebotIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  PictureAsPdf as PdfIcon,
  BoltOutlined as EnergyIcon,
} from '@mui/icons-material';
import type { Customer, Ticket } from '../types/customer';
import { FirebaseService } from '../services/firebase';

export const KundenDetail = () => {
  const { kundennummer } = useParams<{ kundennummer: string }>();
  const navigate = useNavigate();
  const [openMeterReadings, setOpenMeterReadings] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    field: string;
    value: string;
    title: string;
  }>({
    open: false,
    field: '',
    value: '',
    title: '',
  });
  const [newTicketDialog, setNewTicketDialog] = useState(false);
  const [newTicket, setNewTicket] = useState<Partial<Ticket>>({
    typ: 'Anruf',
    status: 'offen',
    kategorie: 'Anfrage',
    prioritaet: 'Niedrig',
    bearbeiter: '',
    beschreibung: '',
    notizen: '',
  });

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!kundennummer) return;
      
      try {
        setLoading(true);
        const fetchedCustomer = await FirebaseService.getCustomer(kundennummer);
        if (fetchedCustomer) {
          setCustomer(fetchedCustomer);
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [kundennummer]);

  const handleEdit = (field: string, value: string, title: string) => {
    setEditDialog({
      open: true,
      field,
      value,
      title,
    });
  };

  const handleSave = async () => {
    if (customer) {
      const updatedCustomer = { ...customer };
      if (editDialog.field.includes('.')) {
        const [parent, child] = editDialog.field.split('.');
        (updatedCustomer as any)[parent][child] = editDialog.value;
      } else {
        (updatedCustomer as any)[editDialog.field] = editDialog.value;
      }
      setCustomer(updatedCustomer);
      // Here you would call FirebaseService to update the customer
    }
    setEditDialog({ ...editDialog, open: false });
  };

  const generateTicketId = () => {
    const year = new Date().getFullYear();
    const lastTicketNumber = Math.max(
      ...customer!.ticketHistory.map(t => 
        parseInt(t.ticketId.split('-')[2] || '0')
      ),
      0
    );
    const newNumber = (lastTicketNumber + 1).toString().padStart(3, '0');
    return `T-${year}-${newNumber}`;
  };

  const handleNewTicket = () => {
    if (customer) {
      const ticketId = generateTicketId();
      const newTicketData: Ticket = {
        ticketId,
        datum: new Date().toISOString(),
        ...newTicket as Omit<Ticket, 'ticketId' | 'datum'>,
      };

      const updatedCustomer = {
        ...customer,
        ticketHistory: [newTicketData, ...customer.ticketHistory],
      };

      setCustomer(updatedCustomer);
      // Here you would call FirebaseService to update the customer
      setNewTicketDialog(false);
      setNewTicket({
        typ: 'Anruf',
        status: 'offen',
        kategorie: 'Anfrage',
        prioritaet: 'Niedrig',
        bearbeiter: '',
        beschreibung: '',
        notizen: '',
      });
    }
  };

  const handleTicketTypeChange = (event: SelectChangeEvent) => {
    setNewTicket({ 
      ...newTicket, 
      typ: event.target.value as Ticket['typ']
    });
  };

  const handleTicketCategoryChange = (event: SelectChangeEvent) => {
    setNewTicket({ 
      ...newTicket, 
      kategorie: event.target.value as Ticket['kategorie']
    });
  };

  const handleTicketPriorityChange = (event: SelectChangeEvent) => {
    setNewTicket({ 
      ...newTicket, 
      prioritaet: event.target.value as Ticket['prioritaet']
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Kunde nicht gefunden</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/stammdaten')}
          sx={{ mt: 2 }}
        >
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }

  const getErfassungsartColor = (erfassungsart: string) => {
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

  const EditableListItem = ({ primary, value, field }: { primary: string; value: string; field: string }) => (
    <ListItem>
      <ListItemText
        primary={primary}
        secondary={value}
      />
      <IconButton
        size="small"
        onClick={() => handleEdit(field, value, primary)}
        sx={{ ml: 1 }}
      >
        <EditIcon fontSize="small" color="primary" />
      </IconButton>
    </ListItem>
  );

  const getTicketIcon = (typ: string) => {
    switch (typ) {
      case 'Anruf':
        return <PhoneIcon />;
      case 'Email':
        return <EmailIcon />;
      case 'Voicebot':
        return <VoicebotIcon />;
      case 'Chat':
        return <ChatIcon />;
      default:
        return <Assignment />;
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'offen':
        return 'error';
      case 'in Bearbeitung':
        return 'warning';
      case 'geschlossen':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTimelineDotColor = (prioritaet: string): 'error' | 'warning' | 'success' | 'grey' => {
    switch (prioritaet) {
      case 'Hoch':
        return 'error';
      case 'Mittel':
        return 'warning';
      case 'Niedrig':
        return 'success';
      default:
        return 'grey';
    }
  };

  return (
    <Box>
      {/* Header with back button */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/stammdaten')}
          sx={{ mb: 2 }}
        >
          Zurück zur Übersicht
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            Übersicht für {customer.name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Kundennummer: {customer.kundennummer}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ mr: 1 }} />
              <Typography variant="h6">Stammdaten</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              <EditableListItem
                primary="Name"
                value={customer.name}
                field="name"
              />
              <EditableListItem
                primary="Straße"
                value={customer.address.street}
                field="address.street"
              />
              <EditableListItem
                primary="Stadt"
                value={customer.address.city}
                field="address.city"
              />
              <EditableListItem
                primary="PLZ"
                value={customer.address.postal_code}
                field="address.postal_code"
              />
              <EditableListItem
                primary="Land"
                value={customer.address.country}
                field="address.country"
              />
              <EditableListItem
                primary="Hotline PIN"
                value={customer.hotline_password}
                field="hotline_password"
              />
              <EditableListItem
                primary="Vertragsnummer"
                value={customer.vertragsnummer}
                field="vertragsnummer"
              />
              <EditableListItem
                primary="Vertragsart"
                value={customer.vertragsart}
                field="vertragsart"
              />
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={
                    <Chip
                      label={customer.status}
                      color={customer.status === 'aktiv' ? 'success' : 'default'}
                      size="small"
                    />
                  }
                />
              </ListItem>
            </List>
          </Paper>

          {/* New Tariff Information Paper */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EnergyIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Tarifdetails</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Tarifname"
                  secondary={customer.tarif.name}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Grundpreis"
                  secondary={`${customer.tarif.grundpreis.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Monat`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Arbeitspreis"
                  secondary={`${customer.tarif.arbeitspreis.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / kWh`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Vertragslaufzeit"
                  secondary={customer.tarif.vertragslaufzeit}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Kündigungsfrist"
                  secondary={customer.tarif.kuendigungsfrist}
                />
              </ListItem>
              {customer.tarif.besonderheiten && customer.tarif.besonderheiten.length > 0 && (
                <ListItem>
                  <ListItemText
                    primary="Besonderheiten"
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        {customer.tarif.besonderheiten.map((feature, index) => (
                          <Chip
                            key={index}
                            label={feature}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          {/* Meter Information */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Speed sx={{ mr: 1 }} />
              <Typography variant="h6">Zählerinformationen</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Zählernummer
                    </Typography>
                    <Typography variant="body1">{customer.zaehlernummer}</Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit('zaehlernummer', customer.zaehlernummer, 'Zählernummer')}
                    sx={{ ml: 1 }}
                  >
                    <EditIcon fontSize="small" color="primary" />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Aktueller Stand
                </Typography>
                <Typography variant="body1">
                  {customer.zaehlerstaende && customer.zaehlerstaende.length > 0 
                    ? `${customer.zaehlerstaende[0].stand.toLocaleString('de-DE')} ${customer.zaehlerstaende[0].einheit}`
                    : 'Keine Zählerstände vorhanden'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Meter Readings History */}
          <Paper sx={{ p: 2 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setOpenMeterReadings(!openMeterReadings)}
            >
              <History sx={{ mr: 1 }} />
              <Typography variant="h6">Zählerstandshistorie</Typography>
              <IconButton size="small" sx={{ ml: 'auto' }}>
                {openMeterReadings ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            <Collapse in={openMeterReadings} timeout="auto" unmountOnExit>
              <Divider sx={{ my: 2 }} />
              <List dense>
                {customer.zaehlerstaende && customer.zaehlerstaende.length > 0 ? (
                  customer.zaehlerstaende.map((reading) => (
                    <ListItem key={reading.datum}>
                      <ListItemText
                        primary={`${reading.stand.toLocaleString('de-DE')} ${reading.einheit}`}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{new Date(reading.datum).toLocaleDateString('de-DE')}</span>
                            <Chip
                              label={reading.erfassungsart}
                              color={getErfassungsartColor(reading.erfassungsart)}
                              size="small"
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="Keine Zählerstände vorhanden" />
                  </ListItem>
                )}
              </List>
            </Collapse>
          </Paper>

          {/* Billing Information */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MoneyIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Zahlungsinformationen</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Abschlagszahlung
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography variant="h5">
                      {customer.abschlag.betrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit('abschlag.betrag', customer.abschlag.betrag.toString(), 'Abschlagsbetrag')}
                    >
                      <EditIcon fontSize="small" color="primary" />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Zahlungsrhythmus
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography variant="body1">
                      {customer.abschlag.zahlungsrhythmus}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit('abschlag.zahlungsrhythmus', customer.abschlag.zahlungsrhythmus, 'Zahlungsrhythmus')}
                    >
                      <EditIcon fontSize="small" color="primary" />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Nächste Fälligkeit
                  </Typography>
                  <Typography variant="body1">
                    {new Date(customer.abschlag.naechsteFaelligkeit).toLocaleDateString('de-DE')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Invoices and Readings */}
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ReceiptIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Rechnungen & Ablesungen</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Datum</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Zählerstand</TableCell>
                  <TableCell>Betrag</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>PDF</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customer.rechnungen.map((rechnung) => {
                  const relatedReading = customer.zaehlerstaende.find(
                    z => z.rechnungsnummer === rechnung.rechnungsnummer
                  );
                  
                  return (
                    <TableRow
                      key={rechnung.rechnungsnummer}
                      onClick={() => navigate(`/stammdaten/${customer.kundennummer}`)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        }
                      }}
                    >
                      <TableCell>
                        {new Date(rechnung.datum).toLocaleDateString('de-DE')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rechnung.typ}
                          size="small"
                          color={rechnung.typ === 'Jahresabrechnung' ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {relatedReading ? (
                          `${relatedReading.stand.toLocaleString('de-DE')} ${relatedReading.einheit}`
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {rechnung.betrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rechnung.status}
                          size="small"
                          color={
                            rechnung.status === 'bezahlt'
                              ? 'success'
                              : rechnung.status === 'überfällig'
                              ? 'error'
                              : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(rechnung.pdfUrl, '_blank');
                          }}
                          color="primary"
                        >
                          <PdfIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>

          {/* Ticket History Section */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <History sx={{ mr: 1 }} />
                    <Typography variant="h6">Ticket Historie</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setNewTicketDialog(true)}
                    size="small"
                  >
                    Neues Ticket
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Timeline>
                  {customer?.ticketHistory.map((ticket) => (
                    <TimelineItem key={ticket.ticketId}>
                      <TimelineOppositeContent color="text.secondary">
                        {new Date(ticket.datum).toLocaleString('de-DE')}
                        <Typography variant="caption" display="block" color="text.secondary">
                          Ticket: {ticket.ticketId}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color={getTimelineDotColor(ticket.prioritaet)}>
                          {getTicketIcon(ticket.typ)}
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="subtitle2" component="span">
                            {ticket.beschreibung}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={ticket.kategorie}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label={ticket.status}
                              size="small"
                              color={getTicketStatusColor(ticket.status)}
                            />
                            <Chip
                              label={ticket.bearbeiter}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          {ticket.notizen && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1, ml: 2, borderLeft: '2px solid #ddd', pl: 1 }}
                            >
                              {ticket.notizen}
                            </Typography>
                          )}
                        </Box>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ ...editDialog, open: false })}>
        <DialogTitle>{`${editDialog.title} bearbeiten`}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={editDialog.value}
            onChange={(e) => setEditDialog({ ...editDialog, value: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ ...editDialog, open: false })} startIcon={<CancelIcon />}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Ticket Dialog */}
      <Dialog 
        open={newTicketDialog} 
        onClose={() => setNewTicketDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Neues Ticket erstellen</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Kontaktart</InputLabel>
              <Select
                value={newTicket.typ}
                label="Kontaktart"
                onChange={handleTicketTypeChange}
              >
                <MenuItem value="Anruf">Anruf</MenuItem>
                <MenuItem value="Email">Email</MenuItem>
                <MenuItem value="Voicebot">Voicebot</MenuItem>
                <MenuItem value="Chat">Chat</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Kategorie</InputLabel>
              <Select
                value={newTicket.kategorie}
                label="Kategorie"
                onChange={handleTicketCategoryChange}
              >
                <MenuItem value="Beschwerde">Beschwerde</MenuItem>
                <MenuItem value="Anfrage">Anfrage</MenuItem>
                <MenuItem value="Zählerstand">Zählerstand</MenuItem>
                <MenuItem value="Rechnung">Rechnung</MenuItem>
                <MenuItem value="Technisch">Technisch</MenuItem>
                <MenuItem value="Sonstiges">Sonstiges</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priorität</InputLabel>
              <Select
                value={newTicket.prioritaet}
                label="Priorität"
                onChange={handleTicketPriorityChange}
              >
                <MenuItem value="Niedrig">Niedrig</MenuItem>
                <MenuItem value="Mittel">Mittel</MenuItem>
                <MenuItem value="Hoch">Hoch</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Bearbeiter"
              value={newTicket.bearbeiter}
              onChange={(e) => setNewTicket({ ...newTicket, bearbeiter: e.target.value })}
            />

            <TextField
              fullWidth
              label="Beschreibung"
              multiline
              rows={2}
              value={newTicket.beschreibung}
              onChange={(e) => setNewTicket({ ...newTicket, beschreibung: e.target.value })}
            />

            <TextField
              fullWidth
              label="Notizen"
              multiline
              rows={3}
              value={newTicket.notizen}
              onChange={(e) => setNewTicket({ ...newTicket, notizen: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTicketDialog(false)} startIcon={<CancelIcon />}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleNewTicket} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!newTicket.bearbeiter || !newTicket.beschreibung}
          >
            Ticket erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 