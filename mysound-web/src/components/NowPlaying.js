import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Heart, Share2, MoreHorizontal, Maximize2, Minimize2, X,
  Plus, ListMusic
} from 'lucide-react';

function NowPlaying({ 
  song, 
  isPlaying, 
  currentTime, 
  duration, 
  volume, 
  onPlayPause, 
  onNext, 
  onPrev, 
  onSeek, 
  onVolumeChange,
  onToggleMute,
  playlist = [],
  currentSongIndex = 0,
  onAddToQueue,
  onPlayFromQueue,
  isSaved = {},
  onSave
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const fullscreenRef = useRef(null);
  const contentRef = useRef(null);

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVolumeClick = () => {
    if (isMuted) {
      onVolumeChange(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  const handleSeek = (e) => {
    const percent = parseFloat(e.target.value);
    if (onSeek && duration > 0) {
      const newTime = (percent / 100) * duration;
      onSeek(newTime);
    }
  };

  const handleLike = () => {
    if (song && onSave) {
      onSave(song);
    }
  };

  const handleAddToQueue = () => {
    if (song && onAddToQueue) {
      onAddToQueue(song);
    }
  };

  const handlePlayFromQueue = (queueSong, index) => {
    if (onPlayFromQueue) {
      onPlayFromQueue(queueSong, index);
    }
  };

  
  const openFullscreen = () => {
    const element = fullscreenRef.current;
    if (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  const closeFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      closeFullscreen();
    } else {
      openFullscreen();
    }
  };

  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);


  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        closeFullscreen();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!song) {
    return (
      <div className="hidden xl:flex flex-col w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 h-screen">
        <div className="p-6 border-b border-white/10 sticky top-0 bg-black/40 backdrop-blur-xl z-10">
          <h2 className="text-white text-xl font-bold">Now Playing</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Play size={32} className="text-white/30" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">Nothing Playing</h3>
            <p className="text-white/40 text-sm">
              Select a song to start listening
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Regular Now Playing Sidebar */}
      <div className="hidden xl:flex flex-col w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 h-screen">
        {/* Fixed Header */}
        <div className="p-6 border-b border-white/10 sticky top-0 bg-black/40 backdrop-blur-xl z-10">
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Now Playing
          </h2>
        </div>

        {/* Scrollable Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          {/* Song Artwork */}
          <div className="p-6">
            <div className="relative group">
              <img 
                src={song.thumbnail} 
                alt={song.title} 
                className="w-full aspect-square object-cover rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button 
                  onClick={onPlayPause}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-2xl"
                >
                  {isPlaying ? (
                    <Pause size={24} className="text-white" fill="white" />
                  ) : (
                    <Play size={24} className="text-white ml-1" fill="white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Song Info */}
          <div className="px-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-xl font-bold truncate mb-1">
                  {song.title}
                </h3>
                <p className="text-white/60 truncate mb-2">
                  {song.channel}
                </p>
                <div className="flex items-center gap-4 text-white/40 text-sm">
                  <span>{song.duration}</span>
                  <span>•</span>
                  <span>YouTube</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleLike}
                  className={`p-2 rounded-2xl transition-all duration-300 ${
                    isSaved[song.id] 
                      ? 'text-green-400 bg-green-400/20' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Heart size={20} fill={isSaved[song.id] ? "currentColor" : "none"} />
                </button>
                <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Volume Control - Above player controls with white border */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-xl border border-white/20">
              <button 
                onClick={handleVolumeClick}
                className="p-2 text-white/60 hover:text-white transition-colors duration-300"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={isMuted ? 0 : volume} 
                onChange={(e) => {
                  const newVolume = parseInt(e.target.value);
                  onVolumeChange(newVolume);
                  if (newVolume > 0) setIsMuted(false);
                }}
                className="flex-1 volume-slider border border-white/30 rounded-full"
                style={{
                  background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume}%, #374151 ${volume}%, #374151 100%)`
                }}
              />
              <span className="text-white/60 text-sm min-w-8 text-right">
                {volume}%
              </span>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button 
                onClick={onPrev}
                className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300"
              >
                <SkipBack size={20} />
              </button>
              <button 
                onClick={onPlayPause}
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg border-2 border-white"
              >
                {isPlaying ? (
                  <Pause size={20} fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" className="ml-1" />
                )}
              </button>
              <button 
                onClick={onNext}
                className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300"
              >
                <SkipForward size={20} />
              </button>
            </div>

            {/* Progress Bar with white border */}
            <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/20">
              <div className="flex justify-between text-white/60 text-sm">
                <span className="border border-white/20 rounded px-2 py-1">{formatTime(currentTime)}</span>
                <span className="border border-white/20 rounded px-2 py-1">{formatTime(duration)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progressPercent} 
                onChange={handleSeek}
                className="w-full h-2 bg-white/20 rounded-full progress-bar cursor-pointer border border-white/30"
                style={{
                  background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${progressPercent}%, #374151 ${progressPercent}%, #374151 100%)`
                }}
              />
            </div>
          </div>

          {/* Queue Section */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">Queue</h4>
              <button 
                onClick={() => setShowQueue(!showQueue)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  showQueue ? 'bg-purple-500/20 text-purple-300' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <ListMusic size={16} />
              </button>
            </div>
            
            {showQueue && playlist.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {playlist.map((queueSong, index) => (
                  <div 
                    key={`${queueSong.id}-${index}`}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                      index === currentSongIndex 
                        ? 'bg-purple-500/20 border border-purple-500/30' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => handlePlayFromQueue(queueSong, index)}
                  >
                    <img 
                      src={queueSong.thumbnail} 
                      alt={queueSong.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        index === currentSongIndex ? 'text-purple-300' : 'text-white'
                      }`}>
                        {queueSong.title}
                      </p>
                      <p className="text-white/60 text-xs truncate">
                        {queueSong.channel}
                      </p>
                    </div>
                    <span className="text-white/40 text-xs">
                      {queueSong.duration}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-white/60 text-sm mb-3">No songs in queue</p>
                <button 
                  onClick={handleAddToQueue}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all duration-300 text-sm"
                >
                  <Plus size={16} />
                  Add Current Song
                </button>
              </div>
            )}
          </div>

          {/* Additional Info Section */}
          <div className="p-6 border-t border-white/10">
            <h4 className="text-white font-semibold mb-4">About this track</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Source</span>
                <span className="text-white">YouTube</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Duration</span>
                <span className="text-white">{song.duration}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Quality</span>
                <span className="text-white">Auto</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">In Library</span>
                <span className={`${isSaved[song.id] ? 'text-green-400' : 'text-white/60'}`}>
                  {isSaved[song.id] ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {/* Fullscreen and Share Section */}
            <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
              <button 
                onClick={toggleFullscreen}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all duration-300 text-sm"
              >
                <Maximize2 size={16} />
                Fullscreen Player
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all duration-300 text-sm">
                <Share2 size={16} />
                Share Track
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Player Overlay */}
      {isFullscreen && (
        <div 
          ref={fullscreenRef}
          className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 z-50 flex flex-col items-center justify-center p-8"
        >
          {/* Close Button */}
          <button 
            onClick={closeFullscreen}
            className="absolute top-6 right-6 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 z-10"
          >
            <X size={24} />
          </button>

          {/* Content */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl w-full">
            {/* Album Art */}
            <div className="relative flex-shrink-0">
              <img 
                src={song.thumbnail} 
                alt={song.title} 
                className="w-80 h-80 lg:w-96 lg:h-96 rounded-3xl object-cover shadow-2xl"
              />
            </div>

            {/* Song Info and Controls */}
            <div className="flex-1 max-w-2xl text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {song.title}
              </h1>
              <h2 className="text-2xl lg:text-3xl text-white/60 mb-8">
                {song.channel}
              </h2>

              {/* Volume Control */}
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6 p-4 bg-white/10 rounded-2xl border border-white/20">
                <button 
                  onClick={handleVolumeClick}
                  className="p-2 text-white/60 hover:text-white transition-colors duration-300"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={24} />
                  ) : (
                    <Volume2 size={24} />
                  )}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={isMuted ? 0 : volume} 
                  onChange={(e) => {
                    const newVolume = parseInt(e.target.value);
                    onVolumeChange(newVolume);
                    if (newVolume > 0) setIsMuted(false);
                  }}
                  className="flex-1 volume-slider border border-white/30 rounded-full"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume}%, #374151 ${volume}%, #374151 100%)`
                  }}
                />
                <span className="text-white/60 text-lg min-w-12 text-right">
                  {volume}%
                </span>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-center lg:justify-start gap-6 mb-6">
                <button 
                  onClick={onPrev}
                  className="p-4 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300"
                >
                  <SkipBack size={32} />
                </button>
                <button 
                  onClick={onPlayPause}
                  className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-2xl border-2 border-white"
                >
                  {isPlaying ? (
                    <Pause size={32} fill="currentColor" />
                  ) : (
                    <Play size={32} fill="currentColor" className="ml-2" />
                  )}
                </button>
                <button 
                  onClick={onNext}
                  className="p-4 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300"
                >
                  <SkipForward size={32} />
                </button>
              </div>

              {/* Progress Bar with white border */}
              <div className="mb-6 p-4 bg-white/10 rounded-2xl border border-white/20">
                <div className="flex justify-between text-white/60 text-lg mb-2">
                  <span className="border border-white/30 rounded px-3 py-1">{formatTime(currentTime)}</span>
                  <span className="border border-white/30 rounded px-3 py-1">{formatTime(duration)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progressPercent} 
                  onChange={handleSeek}
                  className="w-full h-2 bg-white/20 rounded-full progress-bar cursor-pointer border border-white/30"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${progressPercent}%, #374151 ${progressPercent}%, #374151 100%)`
                  }}
                />
              </div>

              {/* Additional Controls */}
              <div className="flex items-center justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleLike}
                    className={`p-3 rounded-2xl transition-all duration-300 ${
                      isSaved[song.id] 
                        ? 'text-green-400 bg-green-400/20' 
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart size={24} fill={isSaved[song.id] ? "currentColor" : "none"} />
                  </button>
                  <button className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300">
                    <Share2 size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/40 text-sm">
            Press ESC to exit fullscreen
          </div>
        </div>
      )}
    </>
  );
}

export default NowPlaying;