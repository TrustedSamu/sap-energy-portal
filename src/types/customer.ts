import { TariffDocument } from '../services/firebase';

export interface Customer {
  kundennummer: string;
  customer_number: string;
  name: string;
  address: {
    street: string;
    postal_code: string;
    city: string;
    country: string;
  };
  hotline_password: string;
  created_at: string;
  updated_at: string;
  zaehlernummer: string;
  zaehlerstaende: MeterReading[];
  vertragsnummer: string;
  vertragsart: string;
  status: 'aktiv' | 'inaktiv';
  ticketHistory: Ticket[];
  abschlag: {
    betrag: number;
    zahlungsrhythmus: 'monatlich' | 'vierteljährlich' | 'halbjährlich' | 'jährlich';
    naechsteFaelligkeit: string;
  };
  rechnungen: Invoice[];
  tarif: TariffDocument;
}

export interface MeterReading {
  datum: string;
  stand: number;
  einheit: string;
  erfassungsart: 'manuell' | 'automatisch' | 'voicebot';
  rechnungsnummer?: string; // Reference to associated invoice if exists
}

export interface Invoice {
  rechnungsnummer: string;
  datum: string;
  betrag: number;
  status: 'bezahlt' | 'offen' | 'überfällig';
  zahlungsfrist: string;
  verbrauchszeitraum: {
    von: string;
    bis: string;
  };
  pdfUrl: string;
  typ: 'Jahresabrechnung' | 'Zwischenabrechnung' | 'Schlussrechnung';
}

export interface Ticket {
  ticketId: string;
  datum: string;
  typ: 'Anruf' | 'Email' | 'Voicebot' | 'Chat';
  status: 'offen' | 'in Bearbeitung' | 'geschlossen';
  kategorie: 'Beschwerde' | 'Anfrage' | 'Zählerstand' | 'Rechnung' | 'Technisch' | 'Sonstiges';
  bearbeiter: string;
  beschreibung: string;
  notizen?: string;
  prioritaet: 'Niedrig' | 'Mittel' | 'Hoch';
} 