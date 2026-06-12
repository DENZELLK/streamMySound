const admin = require("firebase-admin");

let app;

function getAdminApp() {
  if (!app) {
    try {
      // New method: Decode base64 service account JSON
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64) {
        const serviceAccountJson = JSON.parse(
          Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64, 'base64').toString()
        );
        app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountJson)
        });
        return app;
      }

      // Fallback: Old method with individual env vars (for local testing)
      if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
      ) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
        app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey
          })
        });
        return app;
      }

      // No service account env — rely on ADC / hosted environment credentials
      app = admin.initializeApp();
    } catch (err) {
      // If initialization fails, try default init and surface error
      console.error('Failed to init admin SDK:', err);
      try {
        app = admin.initializeApp();
      } catch (err2) {
        console.error('Fallback admin.initializeApp() also failed:', err2);
        throw err;
      }
    }
  }
  return app;
}

module.exports = { getAdminApp };