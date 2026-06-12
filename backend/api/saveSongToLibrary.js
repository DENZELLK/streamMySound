// api/saveSongToLibrary.js
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const uid = await verifyAuth(req);
    
    
    if (!req.body) {
      return res.status(400).json({ error: 'Missing request body' });
    }
    
    const { song } = req.body;
    if (!song || !song.id) {
      return res.status(400).json({ error: 'Missing song information' });
    }

    const userRef = db.collection("users").doc(uid);
    const libraryRef = userRef.collection("library").doc(song.id);

    await libraryRef.set({
      ...song,
      savedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, song });
    
  } catch (err) {
    console.error('SaveSongToLibrary Error:', err.message);
    
    
    if (err.message.includes('Unauthorized') || err.message.includes('auth') || err.message.includes('token')) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
    
    if (err.code === 8 || err.message.includes('Quota exceeded')) {
      return res.status(429).json({ error: 'Quota exceeded. Please try again later.' });
    }
    
    if (err.code === 6 || err.message.includes('already exists')) {
      return res.status(409).json({ error: 'Song already exists in library' });
    }
    
    if (err.message.includes('Firebase') || err.message.includes('permission')) {
      return res.status(403).json({ error: 'Access forbidden' });
    }
    
    if (err.message.includes('invalid') || err.message.includes('Invalid')) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    
    console.error('Server Error:', err);
    return res.status(500).json({ error: 'Failed to save song to library' });
  }
};