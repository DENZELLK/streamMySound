// api/getStreamURL.js
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
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ error: "Missing video id" });

    // Fetch video details
    const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: apiKey
      }
    });

    const item = response.data.items[0];
    if (!item) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const duration = parseDuration(item.contentDetails.duration);

    res.json({
      url: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,  
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      duration  // Bonus: Include duration
    });
  } catch (err) {
    console.error('YouTube API error:', err.response?.data || err.message);
    if (err.response?.status === 403) {
      return res.status(403).json({ error: 'YouTube API quota exceeded or key invalid' });
    }
    res.status(500).json({ error: "Failed to get video details" });
  }
};