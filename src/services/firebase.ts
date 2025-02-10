import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Customer, MeterReading, Ticket, Invoice } from '../types/customer';

export interface AIRelevantInfo {
  lastContact: {
    date: string;
    type: 'Anruf' | 'Email' | 'Voicebot' | 'Chat';
    summary: string;
  };
  preferences: {
    preferredContactMethod: 'Anruf' | 'Email' | 'Voicebot' | 'Chat';
    preferredContactTime?: string;
    language: string;
    specialNeeds?: string[];
  };
  history: {
    paymentHistory: {
      onTimePayments: number;
      latePayments: number;
      lastPaymentDate: string;
    };
    serviceHistory: {
      serviceInterruptions: number;
      lastInterruptionDate?: string;
      plannedServices?: {
        type: string;
        date: string;
      }[];
    };
  };
}

export interface CustomerDocument extends Customer {
  createdAt: string;
  updatedAt: string;
  aiInfo: AIRelevantInfo;
  verbrauchsanalyse: {
    jahresverbrauch: number;
    verbrauchstrend: 'steigend' | 'fallend' | 'stabil';
    vergleichsgruppe: {
      durchschnitt: number;
      position: 'überdurchschnittlich' | 'durchschnittlich' | 'unterdurchschnittlich';
    };
  };
  kommunikation: {
    emailAdresse?: string;
    telefon?: {
      festnetz?: string;
      mobil?: string;
      geschaeftlich?: string;
    };
    kommunikationshistorie: {
      datum: string;
      typ: 'Anruf' | 'Email' | 'Voicebot' | 'Chat';
      notizen: string;
      erfolgreich: boolean;
    }[];
  };
  bankverbindung?: {
    kontoinhaber: string;
    iban: string;
    bic: string;
    sepaMandat: {
      mandatsreferenz: string;
      erteiltAm: string;
    };
  };
}

export interface TariffDocument {
  id: string;
  type: 'basic' | 'eco' | 'premium';
  pricePerKwh: number;
  name?: string;
  description?: string;
  grundpreis: number;
  arbeitspreis: number;
  vertragslaufzeit: string;
  kuendigungsfrist: string;
  besonderheiten: string[];
}

export const FirebaseService = {
  // Customer operations
  async createCustomer(customerData: CustomerDocument): Promise<void> {
    const customerRef = doc(db, 'customers', customerData.kundennummer);
    await setDoc(customerRef, {
      ...customerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async getCustomer(kundennummer: string): Promise<CustomerDocument | null> {
    const customerRef = doc(db, 'customers', kundennummer);
    const customerSnap = await getDoc(customerRef);
    return customerSnap.exists() ? customerSnap.data() as CustomerDocument : null;
  },

  async updateCustomer(kundennummer: string, data: Partial<CustomerDocument>): Promise<void> {
    const customerRef = doc(db, 'customers', kundennummer);
    await updateDoc(customerRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async getAllCustomers(): Promise<CustomerDocument[]> {
    const customersRef = collection(db, 'customers');
    const snapshot = await getDocs(customersRef);
    return snapshot.docs.map(doc => doc.data() as CustomerDocument);
  },

  // AI-specific operations
  async updateAIInfo(kundennummer: string, aiInfo: Partial<AIRelevantInfo>): Promise<void> {
    const customerRef = doc(db, 'customers', kundennummer);
    await updateDoc(customerRef, {
      'aiInfo': aiInfo,
      updatedAt: new Date().toISOString(),
    });
  },

  async updateCommunicationHistory(
    kundennummer: string,
    communication: {
      typ: 'Anruf' | 'Email' | 'Voicebot' | 'Chat';
      notizen: string;
      erfolgreich: boolean;
    }
  ): Promise<void> {
    const customerRef = doc(db, 'customers', kundennummer);
    const customer = await this.getCustomer(kundennummer);
    
    if (customer) {
      const newHistory = {
        datum: new Date().toISOString(),
        ...communication,
      };

      await updateDoc(customerRef, {
        'kommunikation.kommunikationshistorie': [
          newHistory,
          ...(customer.kommunikation.kommunikationshistorie || []),
        ],
        'aiInfo.lastContact': {
          date: newHistory.datum,
          type: communication.typ,
          summary: communication.notizen,
        },
        updatedAt: new Date().toISOString(),
      });
    }
  },

  async updateConsumptionAnalysis(
    kundennummer: string,
    analysis: {
      jahresverbrauch: number;
      verbrauchstrend: 'steigend' | 'fallend' | 'stabil';
      vergleichsgruppe: {
        durchschnitt: number;
        position: 'überdurchschnittlich' | 'durchschnittlich' | 'unterdurchschnittlich';
      };
    }
  ): Promise<void> {
    const customerRef = doc(db, 'customers', kundennummer);
    await updateDoc(customerRef, {
      'verbrauchsanalyse': analysis,
      updatedAt: new Date().toISOString(),
    });
  },

  // Payment operations
  async updatePaymentHistory(
    kundennummer: string,
    payment: {
      onTime: boolean;
      date: string;
    }
  ): Promise<void> {
    const customerRef = doc(db, 'customers', kundennummer);
    const customer = await this.getCustomer(kundennummer);
    
    if (customer) {
      const history = customer.aiInfo.history.paymentHistory;
      await updateDoc(customerRef, {
        'aiInfo.history.paymentHistory': {
          onTimePayments: payment.onTime ? history.onTimePayments + 1 : history.onTimePayments,
          latePayments: payment.onTime ? history.latePayments : history.latePayments + 1,
          lastPaymentDate: payment.date,
        },
        updatedAt: new Date().toISOString(),
      });
    }
  },

  // Service interruption operations
  async recordServiceInterruption(
    kundennummer: string,
    interruption: {
      date: string;
      reason: string;
    }
  ): Promise<void> {
    const customerRef = doc(db, 'customers', kundennummer);
    const customer = await this.getCustomer(kundennummer);
    
    if (customer) {
      const serviceHistory = customer.aiInfo.history.serviceHistory;
      await updateDoc(customerRef, {
        'aiInfo.history.serviceHistory': {
          serviceInterruptions: serviceHistory.serviceInterruptions + 1,
          lastInterruptionDate: interruption.date,
        },
        updatedAt: new Date().toISOString(),
      });
    }
  },

  // Meter reading operations
  async addMeterReading(kundennummer: string, reading: MeterReading): Promise<void> {
    const customerRef = doc(db, 'customers', kundennummer);
    const customer = await this.getCustomer(kundennummer);
    
    if (customer) {
      await updateDoc(customerRef, {
        'zaehlerstaende': [reading, ...customer.zaehlerstaende],
        updatedAt: new Date().toISOString(),
      });
    }
  },

  // Invoice operations
  async addInvoice(kundennummer: string, invoice: Invoice): Promise<void> {
    const customerRef = doc(db, 'customers', kundennummer);
    const customer = await this.getCustomer(kundennummer);
    
    if (customer) {
      await updateDoc(customerRef, {
        'rechnungen': [invoice, ...customer.rechnungen],
        updatedAt: new Date().toISOString(),
      });
    }
  },

  // Ticket operations
  async addTicket(kundennummer: string, ticket: Ticket): Promise<void> {
    const customerRef = doc(db, 'customers', kundennummer);
    const customer = await this.getCustomer(kundennummer);
    
    if (customer) {
      await updateDoc(customerRef, {
        'ticketHistory': [ticket, ...customer.ticketHistory],
        updatedAt: new Date().toISOString(),
      });
    }
  },

  // Tariff operations
  async getAllTariffs(): Promise<TariffDocument[]> {
    const tariffsRef = collection(db, 'tariffs');
    const snapshot = await getDocs(tariffsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TariffDocument));
  },

  async getTariff(tariffId: string): Promise<TariffDocument | null> {
    const tariffRef = doc(db, 'tariffs', tariffId);
    const tariffSnap = await getDoc(tariffRef);
    return tariffSnap.exists() ? { id: tariffSnap.id, ...tariffSnap.data() } as TariffDocument : null;
  },
}; 