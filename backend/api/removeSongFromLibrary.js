// api/removeSongFromLibrary.js
require('dotenv').config();

const { getAdminApp } = require('../lib/firebaseAdmin');
const admin = require('firebase-admin');
const app = getAdminApp();
const db = admin.firestore();

async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized - missing token');
  }
  const idToken = authHeader.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  return decodedToken.uid;
}

module.exports = async (req, res) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigins);
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const uid = await verifyAuth(req);
    
    
    if (!req.body) {
      return res.status(400).json({ error: 'Missing request body' });
    }
    
    const { songId } = req.body;
    if (!songId) {
      return res.status(400).json({ error: 'Missing song ID' });
    }

    const userRef = db.collection("users").doc(uid);
    const libraryRef = userRef.collection("library").doc(songId);

    const doc = await libraryRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Song not found in library' });
    }

    await libraryRef.delete();

    res.json({ success: true, message: 'Song removed from library' });
    
  } catch (err) {
    console.error('RemoveSongFromLibrary Error:', err.message);
    
   
    if (err.message.includes('Unauthorized') || err.message.includes('auth') || err.message.includes('token')) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
    
    if (err.code === 8 || err.message.includes('Quota exceeded')) {
      return res.status(429).json({ error: 'Quota exceeded. Please try again later.' });
    }
    
    if (err.message.includes('Firebase') || err.message.includes('permission')) {
      return res.status(403).json({ error: 'Access forbidden' });
    }
    
    if (err.message.includes('invalid') || err.message.includes('Invalid')) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    // Only return 500 for actual server errors
    console.error('Server Error:', err);
    return res.status(500).json({ error: 'Failed to remove song from library' });
  }
};