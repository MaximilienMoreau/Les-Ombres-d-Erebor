/* ============================================
   CONFIGURATION FIREBASE
   ============================================
   1. Créez un projet sur https://console.firebase.google.com
   2. Activez "Realtime Database" (mode test pour commencer)
   3. Allez dans Paramètres du projet > Vos applications > SDK Config
   4. Copiez les valeurs ci-dessous
   5. Passez `configured` à true
   ============================================ */

const FIREBASE_CONFIG = {
  configured: false,          // ← Passez à true après avoir rempli les champs

  apiKey:            "VOTRE_API_KEY",
  authDomain:        "votre-projet.firebaseapp.com",
  databaseURL:       "https://votre-projet-default-rtdb.firebaseio.com",
  projectId:         "votre-projet",
  storageBucket:     "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123",
};

/* Règles Firebase Realtime Database recommandées :
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": "auth != null || true",
        ".write": "auth != null || true"
      }
    }
  }
}
*/
