import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Customer, MeterReading } from '../types/customer';

export const FirebaseService = {
  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    const customersRef = collection(db, 'customers');
    const snapshot = await getDocs(customersRef);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        kundennummer: data.kundennummer,
        name: data.name,
        adresse: data.adresse,
        zaehlernummer: data.zaehlernummer,
        zaehlerstaende: data.zaehlerstaende,
        vertragsnummer: data.vertragsnummer,
        vertragsart: data.vertragsart,
        status: data.status,
      } as Customer;
    });
  },

  async updateCustomer(kundennummer: string, data: Partial<Customer>): Promise<void> {
    const customerRef = doc(db, 'customers', kundennummer);
    await updateDoc(customerRef, data);
  },

  async addCustomer(customer: Customer): Promise<void> {
    const customerRef = doc(db, 'customers', customer.kundennummer);
    await setDoc(customerRef, customer);
  },

  // Meter reading operations
  async getMeterReadings(kundennummer?: string): Promise<MeterReading[]> {
    const readingsRef = collection(db, 'meter_readings');
    let q = query(readingsRef, orderBy('datum', 'desc'));
    
    if (kundennummer) {
      q = query(readingsRef, where('kundennummer', '==', kundennummer), orderBy('datum', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as MeterReading);
  },

  async addMeterReading(reading: MeterReading & { kundennummer: string }): Promise<void> {
    const readingRef = doc(collection(db, 'meter_readings'));
    await setDoc(readingRef, {
      ...reading,
      timestamp: new Date(),
    });
  },

  // Voicebot specific operations
  async updateMeterReadingViaVoicebot(
    kundennummer: string,
    reading: Omit<MeterReading, 'erfassungsart'>
  ): Promise<void> {
    await this.addMeterReading({
      ...reading,
      kundennummer,
      erfassungsart: 'voicebot',
    });

    // Update the latest reading in customer document
    await this.updateCustomer(kundennummer, {
      zaehlerstaende: [{ ...reading, erfassungsart: 'voicebot' }],
    });
  },
}; 