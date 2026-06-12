// backend/functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

// Lazy-load YouTube client (youtubei.js is ESM-only in recent versions).
let _youtubePromise = null;
async function getYoutube() {
  if (!_youtubePromise) {
    _youtubePromise = import('youtubei.js').then(mod => new mod.Innertube());
  }
  return _youtubePromise;
}

// ----------------------
// SEARCH MUSIC
// ----------------------
exports.searchMusic = functions.https.onRequest(async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query parameter 'q'" });

  const youtube = await getYoutube();
  const results = await youtube.search(query, { type: "video" });
    // Return first 10 results
    const songs = results.slice(0, 10).map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnails[0]?.url,
      duration: video.duration?.toString(),
      channel: video.author?.name
    }));

    res.json({ songs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "YouTube search failed" });
  }
});

// ----------------------
// GET STREAM URL (PLAYABLE, NON-DOWNLOAD)
// ----------------------
exports.getStreamURL = functions.https.onRequest(async (req, res) => {
  try {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ error: "Missing video id" });

  const youtube = await getYoutube();
  const video = await youtube.getVideo(videoId);
    // Return streaming URL (best audio only)
    const audioFormats = video.formats.filter(f => f.hasAudio && !f.hasVideo);
    const bestAudio = audioFormats[audioFormats.length - 1]; // pick best quality

    res.json({ url: bestAudio?.url, title: video.title, thumbnail: video.thumbnails[0]?.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get stream URL" });
  }
});

// ----------------------
// SAVE SONG TO USER LIBRARY
// ----------------------
exports.saveSongToLibrary = functions.https.onRequest(async (req, res) => {
  try {
  const { uid, song } = req.body;
    if (!uid || !song || !song.id) return res.status(400).json({ error: "Missing uid or song info" });

    const userRef = db.collection("users").doc(uid);
    const libraryRef = userRef.collection("library").doc(song.id);

    await libraryRef.set({ ...song, savedAt: admin.firestore.FieldValue.serverTimestamp() });

    res.json({ success: true, song });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save song" });
  }
});

// ----------------------
// GET USER LIBRARY
// ----------------------
exports.getUserLibrary = functions.https.onRequest(async (req, res) => {
  try {
    const uid = req.query.uid;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

  const librarySnapshot = await db.collection("users").doc(uid).collection("library").orderBy("savedAt", "desc").get();
    const songs = librarySnapshot.docs.map(doc => doc.data());

    res.json({ songs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get user library" });
  }
});
