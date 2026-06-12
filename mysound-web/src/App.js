import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthModal from './components/AuthModal';
import Library from './components/Library';
import NowPlaying from './components/NowPlaying';
import Home from './components/Home';
import ProfileModal from './components/ProfileModal';
import PlayerControls from './components/PlayerControls';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';
import { useApi } from './hooks/useApi';
import { auth } from './firebase';
import './App.css';

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const { callApi } = useApi();
  const [query, setQuery] = useState('');
  const [libraryCount, setLibraryCount] = useState(0);
  const [page, setPage] = useState('home');
  const [searchResults, setSearchResults] = useState([]);
  const [isSaved, setIsSaved] = useState({});
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [volume, setVolume] = useState(80);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMuted, setIsMuted] = useState(false);
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: '',
    email: '',
    password: ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [feedbackSent, setFeedbackSent] = useState(false);

  const playerRef = useRef(null);
  const searchInputRef = useRef(null);

  const formatTime = (secs) => {
    if (!secs || secs <= 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (window.YT && window.YT.Player) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {};
  }, []);

  useEffect(() => {
    if (user) {
      fetchLibrary();
      const key = `recentlyPlayed_${user.uid}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setRecentlyPlayed(JSON.parse(saved));
      }
    } else {
      setLibraryCount(0);
      setPlaylist([]);
      setIsSaved({});
      setApiError(null);
      setRecentlyPlayed([]);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setCurrentTime(0);
      setDuration(0);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const key = `recentlyPlayed_${user.uid}`;
      localStorage.setItem(key, JSON.stringify(recentlyPlayed));
    }
  }, [recentlyPlayed, user]);

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  const onPlayerReady = (event) => {
    event.target.setVolume(isMuted ? 0 : volume);
    if (!intervalId) {
      const id = setInterval(() => {
        const p = playerRef.current;
        if (p && p.getCurrentTime) {
          setCurrentTime(p.getCurrentTime());
          const d = p.getDuration();
          if (d > 0) setDuration(d);
        }
      }, 1000);
      setIntervalId(id);
    }
  };

  const onPlayerStateChange = (event) => {
    switch (event.data) {
      case window.YT.PlayerState.ENDED:
        setIsPlaying(false); 
        if (repeat) {
          const player = playerRef.current;
          if (player && currentSong) {
            player.seekTo(0);
            setTimeout(() => {
              player.playVideo();
              setIsPlaying(true);
            }, 100);
          }
        } else {
          handleNext();
        }
        break;
      case window.YT.PlayerState.PLAYING:
        setIsPlaying(true);
        break;
      case window.YT.PlayerState.PAUSED:
        setIsPlaying(false);
        break;
    }
  };

  useEffect(() => {
  if (!currentSong || !currentSong.videoId) return;

  const origin = window.location.origin;

  const initPlayer = () => {
    const player = playerRef.current;

    if (player && typeof player.loadVideoById === 'function') {
      player.loadVideoById(currentSong.videoId);
    } else {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player('player', {
        height: '1',
        width: '1',
        videoId: currentSong.videoId,
        playerVars: {
          'playsinline': 1,
          'controls': 0,
          'modestbranding': 1,
          'rel': 0,
          'autoplay': 1,
          'origin': origin,
          'enablejsapi': 1
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }
  };

  if (window.YT?.Player) {
    initPlayer();
  } else {
    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };
  }

  setCurrentTime(0);
  setDuration(0);
  setIsPlaying(false);
}, [currentSong]);

  const fetchLibrary = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await callApi('/api/getUserLibrary');
      const songsWithVideoId = data.songs.map(song => ({
        ...song,
        videoId: song.videoId || song.id
      }));
      setLibraryCount(songsWithVideoId.length);
      setPlaylist(songsWithVideoId);
      const savedMap = {};
      songsWithVideoId.forEach(s => savedMap[s.id] = true);
      setIsSaved(savedMap);
    } catch (error) {
      console.error('Library fetch failed:', error.message, error.status); 
      setApiError('service_unavailable');
      setPlaylist([]);
      setLibraryCount(0);
      setIsSaved({});
    } finally {
      setLoading(false);
    }
  };

  const searchMusic = async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    setApiError(null);
    try {
      const data = await callApi(`/api/searchMusic?q=${encodeURIComponent(query)}`);
      const resultsWithVideoId = data.songs.map(song => ({
        ...song,
        videoId: song.videoId || song.id
      }));
      setSearchResults(resultsWithVideoId);
    } catch (error) {
      console.error('Search failed:', error);
      setApiError('search_error');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const saveSong = async (song) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    
    if (isSaved[song.id]) {
      showToast('Song is already in your library', 'info');
      return;
    }
    
    setIsSaved(prev => ({ ...prev, [song.id]: true }));
    setLibraryCount(prev => prev + 1);
    setPlaylist(prev => [song, ...prev]);
    
    try {
      await callApi('/api/saveSongToLibrary', { 
        method: 'POST', 
        body: JSON.stringify({ song }) 
      });
      showToast('Song added to library', 'success');
    } catch (error) {
      console.error('Save failed:', error);
      setIsSaved(prev => ({ ...prev, [song.id]: false }));
      setLibraryCount(prev => prev - 1);
      setPlaylist(prev => prev.filter(s => s.id !== song.id));
      showToast('Failed to add song to library', 'error');
    }
  };

  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(false);
    setRecentlyPlayed(prev => {
      const newPlayed = [song, ...prev.filter(s => s.id !== song.id)];
      return newPlayed.slice(0, 10);
    });
  };

 const handlePlayPause = () => {
  const player = playerRef.current;
  if (!player || typeof player.playVideo !== 'function') {
    console.warn('Player not ready yet');
    return;
  }
  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
};

  const handleSeek = (e) => {
    const percent = parseFloat(e.target.value);
    const player = playerRef.current;
    if (player && player.seekTo && duration > 0) {
      const newTime = (percent / 100) * duration;
      player.seekTo(newTime);
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (playerRef.current) {
        playerRef.current.setVolume(volume);
      }
    } else {
      setIsMuted(true);
      if (playerRef.current) {
        playerRef.current.setVolume(0);
      }
    }
  };

  const handleNext = () => {
    if (playlist.length > 0) {
      const currentIndex = playlist.findIndex(s => s.id === currentSong?.id);
      let nextIndex;
      
      if (shuffle) {
      
        do {
          nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentIndex && playlist.length > 1);
      } else {
        nextIndex = (currentIndex + 1) % playlist.length;
      }
      
      const nextSong = playlist[nextIndex];
      playSong(nextSong);
    }
  };

  const handlePrev = () => {
    if (playlist.length > 0) {
      const currentIndex = playlist.findIndex(s => s.id === currentSong?.id);
      let prevIndex;
      
      if (shuffle) {
      
        do {
          prevIndex = Math.floor(Math.random() * playlist.length);
        } while (prevIndex === currentIndex && playlist.length > 1);
      } else {
        prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = playlist.length - 1;
      }
      
      const prevSong = playlist[prevIndex];
      playSong(prevSong);
    }
  };

  const toggleShuffle = () => setShuffle(!shuffle);
  const toggleRepeat = () => setRepeat(!repeat);

  const retryApiCall = () => {
    setApiError(null);
    if (user) fetchLibrary();
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setShowProfileModal(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    console.log('Feedback submitted:', feedback);
    setFeedbackSent(true);
    setFeedback('');
    showToast('Thank you for your feedback!', 'success');
    
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (editData.email && !/\S+@\S+\.\S+/.test(editData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (editData.password && editData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the form errors', 'error');
      return;
    }
    
    setUpdatingProfile(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Profile update:', editData);
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
      
      setEditData({
        displayName: user?.displayName || '',
        email: user?.email || '',
        password: ''
      });
    } catch (error) {
      console.error('Update failed:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
        displayName: user?.displayName || '',
        email: user?.email || '',
        password: ''
    });
    setErrors({});
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditData({
        displayName: user?.displayName || '',
        email: user?.email || '',
        password: ''
    });
    setErrors({});
  };

 
  const handleAddToQueue = (song) => {
    if (!playlist.some(s => s.id === song.id)) {
      setPlaylist(prev => [...prev, song]);
      showToast('Song added to queue', 'success');
    } else {
      showToast('Song is already in queue', 'info');
    }
  };

  const handlePlayFromQueue = (song, index) => {
    playSong(song);
  };

  const currentSongIndex = playlist.findIndex(s => s.id === currentSong?.id);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 text-white">
        {/* Hidden YouTube Player */}
        <div 
          id="player" 
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            width: 1, 
            height: 1,
            opacity: 0 
          }}
        ></div>
        
        {/* Main Layout */}
        <div className="flex h-screen">
          {/* Sidebar */}
          {!isMobile && (
            <Sidebar 
              page={page} 
              setPage={setPage} 
              user={user}
              setShowProfileModal={setShowProfileModal}
              isMobile={isMobile}
            />
          )}
          
          {/* Main Content Area */}
          <div className={`flex-1 transition-all duration-300 flex flex-col ${
            !isMobile ? 'ml-20' : ''
          } ${
            page === 'home' && !isMobile ? 'mr-[calc(20rem+0.25rem)]' : ''
          }`}>
            {/* Home Page with Custom Scroll */}
            {page === 'home' && (
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto custom-scrollbar pr-1">
                  <Home
                    query={query}
                    setQuery={setQuery}
                    searchMusic={searchMusic}
                    loading={loading}
                    apiError={apiError}
                    retryApiCall={retryApiCall}
                    searchResults={searchResults}
                    recentlyPlayed={recentlyPlayed}
                    playlist={playlist}
                    libraryCount={libraryCount}
                    isSaved={isSaved}
                    playSong={playSong}
                    saveSong={saveSong}
                    isAuthenticated={!!user}
                    searchInputRef={searchInputRef}
                    setApiError={setApiError}
                    onAddToQueue={handleAddToQueue}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            )}
            
            {/* Library Page */}
            {page === 'library' && (
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto custom-scrollbar">
                  <Library playSong={playSong} />
                </div>
              </div>
            )}
          </div>
          
          {/* Now Playing Sidebar - Only on home page and desktop */}
          {page === 'home' && !isMobile && (
            <div className="hidden xl:block fixed right-[0.25rem] top-0 h-screen w-80 z-40 bg-black/95 backdrop-blur-xl border-l border-white/10">
              <NowPlaying
                song={currentSong}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onPrev={handlePrev}
                onSeek={handleSeek}
                onVolumeChange={handleVolumeChange}
                onToggleMute={handleToggleMute}
                playlist={playlist}
                currentSongIndex={currentSongIndex}
                onAddToQueue={handleAddToQueue}
                onPlayFromQueue={handlePlayFromQueue}
                isSaved={isSaved} 
                onSave={saveSong}
              />
            </div>
          )}
        </div>
        
        {isMobile && (
          <MobileBottomNav 
            page={page}
            setPage={setPage}
            user={user}
            setShowProfileModal={setShowProfileModal}
            searchInputRef={searchInputRef}
            showProfileModal={showProfileModal}
          />
        )}
        
        <PlayerControls
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          shuffle={shuffle}
          repeat={repeat}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrev={handlePrev}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          toggleShuffle={toggleShuffle}
          toggleRepeat={toggleRepeat}
          formatTime={formatTime}
        />
        
        {/* Auth Modal */}
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        
        {/* Profile Modal */}
        <ProfileModal
          showProfileModal={showProfileModal}
          setShowProfileModal={setShowProfileModal}
          user={user}
          setShowAuth={setShowAuth}
          feedback={feedback}
          setFeedback={setFeedback}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          editData={editData}
          setEditData={setEditData}
          updatingProfile={updatingProfile}
          errors={errors}
          setErrors={setErrors}
          feedbackSent={feedbackSent}
          setFeedbackSent={setFeedbackSent}
          handleFeedbackSubmit={handleFeedbackSubmit}
          handleSaveProfile={handleSaveProfile}
          handleCancelEdit={handleCancelEdit}
          startEditing={startEditing}
          handleSignOut={handleSignOut}
        />
        
        {/* Toast Component */}
        <Toast toast={toast} />
      </div>
    </Router>
  );
}

export default App;