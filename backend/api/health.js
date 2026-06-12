// api/health.js
require('dotenv').config();  

const { getAdminApp } = require('../lib/firebaseAdmin');
const admin = require('firebase-admin');


let app;
try {
  app = getAdminApp();
} catch (err) {
  console.error('Firebase health check failed:', err);
}

module.exports = async (req, res) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigins);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
   
    if (app) {
      const db = admin.firestore();
      await db.collection('users').limit(1).get();  
    }

    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Backend is healthy' 
    });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ 
      status: 'error', 
      message: 'Backend health check failed' 
    });
  }
};