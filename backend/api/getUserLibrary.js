// api/getUserLibrary.js
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
    const uid = await verifyAuth(req);

    // Get query parameters for pagination
    const { pageSize = 50, startAfterId } = req.query;
    const pageSizeNum = parseInt(pageSize, 10);
    if (isNaN(pageSizeNum) || pageSizeNum <= 0) {
      return res.status(400).json({ error: 'Invalid pageSize' }); 
    }

    let libraryQuery = db
      .collection("users")
      .doc(uid)
      .collection("library")
      .orderBy("savedAt", "desc")
      .limit(pageSizeNum);

    if (startAfterId) {
      const startAfterDoc = await db
        .collection("users")
        .doc(uid)
        .collection("library")
        .doc(startAfterId)
        .get();
      
      if (!startAfterDoc.exists) {
        return res.status(400).json({ error: 'Invalid startAfterId' }); // Fixed: return proper 400
      }
      
      libraryQuery = libraryQuery.startAfter(startAfterDoc);
    }

    const librarySnapshot = await libraryQuery.get();

    const songs = librarySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const lastDocId = librarySnapshot.docs.length > 0 ? librarySnapshot.docs[librarySnapshot.docs.length - 1].id : null;

    res.json({ songs, lastDocId });
    
  } catch (err) {
    console.error('GetUserLibrary Error:', err.message);
    
    
    if (err.message.includes('Unauthorized') || err.message.includes('auth')) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
    
    if (err.code === 8 || err.message.includes('Quota exceeded')) {
      return res.status(429).json({ error: "Quota exceeded. Please try again later." });
    }
    
    if (err.message.includes('Firebase') || err.message.includes('permission') || err.message.includes('not found')) {
      return res.status(404).json({ error: "Resource not found" });
    }
    
    if (err.message.includes('invalid') || err.message.includes('Invalid')) {
      return res.status(400).json({ error: "Invalid request" });
    }
    
    // Only return 500 for actual server errors
    console.error('Server Error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
};