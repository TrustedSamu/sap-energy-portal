# SAP Energy Portal

A modern SAP-like interface for energy utilities with voicebot integration. This application provides a user interface for managing customer data, meter readings, and voicebot interactions in the energy sector.

## Features

- 📊 Dashboard with key metrics
- 👤 Customer data management (Stammdaten)
- 📝 Meter reading management (Zählerstände)
- 🤖 Voicebot integration for automated meter reading collection
- 🔄 Real-time Firebase synchronization
- 🎨 SAP-like user interface
- 🔐 Firebase Authentication

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
   - Enable Firestore Database and Authentication
   - Copy your Firebase configuration
   - Create a `.env` file based on `.env.example`
   - Fill in your Firebase credentials in the `.env` file

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

## Firebase Data Structure

### Collections

1. `customers`:
   - Document ID: `kundennummer`
   - Fields: name, adresse, zaehlernummer, etc.

2. `meter_readings`:
   - Document ID: auto-generated
   - Fields: kundennummer, datum, stand, einheit, erfassungsart

## Authentication

The application uses Firebase Authentication for user management. The following features are available:

- User sign-up and sign-in
- Password reset
- Session management
- Role-based access control

## Voicebot Integration

The application includes endpoints for voicebot integration:

- Update meter readings via voicebot
- Query customer information
- Validate meter readings

## Development

- Built with React + TypeScript
- Uses Material-UI for SAP-like interface
- Firebase for real-time data synchronization and authentication

## Production Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Security

- Environment variables are used to protect Firebase credentials
- Authentication is required for all database operations
- Firestore security rules should be configured in Firebase Console

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
