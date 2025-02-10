export interface Customer {
  kundennummer: string;
  name: string;
  adresse: {
    strasse: string;
    hausnummer: string;
    plz: string;
    ort: string;
  };
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
  tarif: {
    name: string;
    grundpreis: number;  // Base price per month
    arbeitspreis: number;  // Price per kWh
    vertragslaufzeit: string;  // Contract duration
    kuendigungsfrist: string;  // Notice period
    besonderheiten?: string[];  // Special features like green energy, etc.
  };
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