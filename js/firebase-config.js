/* Firebase settings for the shared database.
 * Leave as null to keep data only in this browser.
 * To go online, paste the config from Firebase console →
 * Project settings → General → Your apps → Web app → "SDK setup and configuration" → Config.
 * (These values are not secret.) */
window.BDRB_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA9yXkeySzN3tLh5nCGw26jgIsuB0htYkI",
  authDomain: "blood-diamond-ring.firebaseapp.com",
  databaseURL: "https://blood-diamond-ring-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "blood-diamond-ring",
  storageBucket: "blood-diamond-ring.firebasestorage.app",
  messagingSenderId: "507494985377",
  appId: "1:507494985377:web:3e788ed10e53ee5ebd8ae0",
};

/* false: no login, anyone who opens the page can view and edit (use database.rules.json).
 * true:  admins sign in with email/password (use database.rules.login.json). */
window.BDRB_REQUIRE_LOGIN = false;

/* Example:
window.BDRB_FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "your-project",
  appId: "1:1234567890:web:abcdef",
};
*/
