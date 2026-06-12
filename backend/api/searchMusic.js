// api/searchMusic.js
require('dotenv').config();

const { getAdminApp } = require('../lib/firebaseAdmin');
const admin = require('firebase-admin');
getAdminApp();

const axios = require('axios');

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const apiKey = process.env.YOUTUBE_API_KEY;

if (!apiKey) {
  throw new Error('YOUTUBE_API_KEY env var is required');
}


function parseDuration(isoDuration) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const [, hours, minutes, seconds] = match;
  const totalMinutes = (parseInt(hours || 0) * 60) + parseInt(minutes || 0);
  const mins = totalMinutes % 60;
  const secs = parseInt(seconds || 0);
  return `${totalMinutes > 59 ? hours + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

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
   
    await verifyAuth(req);
    
    const query = req.query.q;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

   
    const searchResponse = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: 'id,snippet',
        q: query,
        type: 'video',
        maxResults: 10,
        key: apiKey,
        order: 'relevance'
      },
      timeout: 10000 
    });

    const items = searchResponse.data.items.filter(item => item.id.kind === 'youtube#video');
    if (items.length === 0) {
      return res.json({ songs: [] });
    }

    
    const videoIds = items.map(item => item.id.videoId).join(',');

  
    const videosResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'contentDetails',
        id: videoIds,
        key: apiKey
      },
      timeout: 10000 
    });

  
    const videoDetailsMap = {};
    videosResponse.data.items.forEach(video => {
      videoDetailsMap[video.id] = {
        duration: parseDuration(video.contentDetails.duration)
      };
    });

   
    const songs = items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      duration: videoDetailsMap[item.id.videoId]?.duration || '0:00',
      channel: item.snippet.channelTitle,
      videoId: item.id.videoId 
    }));

    res.json({ songs });
    
  } catch (err) {
    console.error('SearchMusic Error:', err.message);
    
   
    if (err.message.includes('Unauthorized') || err.message.includes('auth') || err.message.includes('token')) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
    
    
    if (err.response?.status === 403 || err.message.includes('quota') || err.message.includes('Quota')) {
      return res.status(429).json({ error: 'YouTube API quota exceeded. Please try again later.' });
    }
    
    if (err.response?.status === 400 || err.message.includes('invalid') || err.message.includes('Invalid')) {
      return res.status(400).json({ error: 'Invalid search query' });
    }
    
    
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout') || err.message.includes('Timeout')) {
      return res.status(408).json({ error: 'Search request timed out' });
    }
    
    if (err.code === 'ENOTFOUND' || err.message.includes('network') || err.message.includes('Network')) {
      return res.status(503).json({ error: 'Search service temporarily unavailable' });
    }
    
    
    if (err.response?.status === 401 || err.message.includes('API key')) {
      return res.status(500).json({ error: 'Search service configuration error' });
    }
    
    
    console.error('Server Error:', err);
    return res.status(500).json({ error: 'Search service temporarily unavailable' });
  }
};