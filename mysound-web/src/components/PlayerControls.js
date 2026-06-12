import React from 'react';
import { Shuffle, Repeat, Volume2, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const PlayerControls = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  shuffle,
  repeat,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  toggleShuffle,
  toggleRepeat,
  formatTime
}) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 p-4 flex items-center gap-4 z-40 h-24"> {/* Fixed height */}
      {/* Song Info - Stable layout */}
      <div className="flex items-center gap-3 min-w-0 flex-1 max-w-xs">
        {currentSong ? (
          <>
            <img 
              src={currentSong.thumbnail} 
              alt={currentSong.title} 
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-medium text-sm truncate">{currentSong.title}</h4>
              <p className="text-white/60 text-xs truncate">{currentSong.channel}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Play size={20} className="text-white/30" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-medium text-sm">No song playing</h4>
              <p className="text-white/60 text-xs">Select a song to start</p>
            </div>
          </>
        )}
      </div>

      {/* Player Controls and Progress Bar */}
      <div className="flex-1 flex flex-col items-center gap-3 max-w-2xl">
        {/* Player Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleShuffle} 
            className={`p-2 rounded-full transition-all duration-300 ${
              shuffle ? 'text-purple-400 bg-purple-400/20' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Shuffle size={18} />
          </button>
          <button onClick={onPrev} className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
            <SkipBack size={20} />
          </button>
          <button 
            onClick={onPlayPause} 
            className="bg-white text-black rounded-full p-3 hover:scale-105 transition-all duration-300 shadow-lg flex-shrink-0"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <button onClick={onNext} className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
            <SkipForward size={20} />
          </button>
          <button 
            onClick={toggleRepeat} 
            className={`p-2 rounded-full transition-all duration-300 ${
              repeat ? 'text-purple-400 bg-purple-400/20' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Repeat size={18} />
          </button>
        </div>

        {/* Progress Bar with purple progress indicator */}
        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="text-white/60 text-xs w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={progressPercent}
              onChange={onSeek}
              className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer progress-slider"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${progressPercent}%, #4b5563 ${progressPercent}%, #4b5563 100%)`
              }}
            />
          </div>
          <span className="text-white/60 text-xs w-12">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3 w-40">
        <button 
          onClick={onToggleMute}
          className="p-2 text-white/60 hover:text-white transition-colors flex items-center gap-2"
          title="Volume"
        >
          <Volume2 size={18} />
          <span className="text-xs text-white/60 hidden sm:block">Volume</span>
        </button>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={isMuted ? 0 : volume} 
          onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-gray-600 rounded-full appearance-none cursor-pointer volume-slider"
          style={{
            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${isMuted ? 0 : volume}%, #4b5563 ${isMuted ? 0 : volume}%, #4b5563 100%)`
          }}
        />
      </div>
    </div>
  );
};

export default PlayerControls;