# SAP Energy Portal

A modern SAP-like interface for energy utilities with voicebot integration. This application provides a user interface for managing customer data, meter readings, and voicebot interactions in the energy sector.

## Features

- 📊 Dashboard with key metrics
- 👤 Customer data management (Stammdaten)
- 📝 Meter reading management (Zählerstände)
- 🤖 Voicebot integration for automated meter reading collection
- 🔄 Real-time Firebase synchronization
- 🎨 SAP-like user interface

## Prerequisites

- Node.js 18.x
- npm or yarn
- Firebase account with Firestore database

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd sap-energy-portal
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Copy your Firebase configuration from Project Settings
   - Update the configuration in `src/firebase/config.ts`

4. Start the development server:
```bash
npm run dev
```

## Firebase Data Structure

### Collections

1. `customers`:
   - Document ID: `kundennummer`
   - Fields: name, adresse, zaehlernummer, etc.

2. `meter_readings`:
   - Document ID: auto-generated
   - Fields: kundennummer, datum, stand, einheit, erfassungsart

## Voicebot Integration

The application includes endpoints for voicebot integration:

- Update meter readings via voicebot
- Query customer information
- Validate meter readings

## Development

- Built with React + TypeScript
- Uses Material-UI for SAP-like interface
- Firebase for real-time data synchronization

## Production Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
