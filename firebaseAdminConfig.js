const admin = require('firebase-admin');
require('dotenv').config();  // Lädt die Umgebungsvariablen aus der .env-Datei


export const getGCPCredentials = () => {
    // for Vercel, use environment variables
    return process.env.GCP_PRIVATE_KEY
      ? {
          credentials: {
            client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GCP_PRIVATE_KEY,
          },
          projectId: process.env.GCP_PROJECT_ID,
        }
        // for local development, use gcloud CLI
      : {};
  };
  


// Initialisierung der Firebase Admin SDK mit der oben definierten Konfiguration
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(getGCPCredentials()),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,  // Falls du eine Firebase Realtime Database verwendest
    });
}

// Export Firestore database instance
export const adb = admin.firestore();
