const admin = require('firebase-admin');
require('dotenv').config();  // Lädt die Umgebungsvariablen aus der .env-Datei

// Die Firebase Admin-Konfiguration mit den Umgebungsvariablen
const firebaseAdminConfig = {
    type: process.env.NEXT_PUBLIC_FIREBASE_TYPE,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    privateKeyId: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),  // Private Key mit richtigen Zeilenumbrüchen
    clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
    clientId: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_ID,
    authUri: process.env.NEXT_PUBLIC_FIREBASE_AUTH_URI,
    tokenUri: process.env.NEXT_PUBLIC_FIREBASE_TOKEN_URI,
    authProviderCertUrl: process.env.NEXT_PUBLIC_FIREBASE_AUTH_PROVIDER_CERT_URL,
    clientCertUrl: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_CERT_URL,
    universeDomain: process.env.NEXT_PUBLIC_FIREBASE_UNIVERSE_DOMAIN
};



// Initialisierung der Firebase Admin SDK mit der oben definierten Konfiguration
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(firebaseAdminConfig),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,  // Falls du eine Firebase Realtime Database verwendest
    });
}

// Export Firestore database instance
export const adb = admin.firestore();
