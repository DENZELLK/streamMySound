import React from 'react';
import { Play, Heart, Plus } from 'lucide-react';

const SongCard = ({ song, index, showIndex = false, onPlay, onSave, isSaved }) => (
  <div 
    className="group bg-white/5 backdrop-blur-lg rounded-lg p-2 hover:bg-white/10 transition-all duration-300 cursor-pointer border border-white/10 hover:border-purple-500/30"
    onClick={() => onPlay(song)}
  >
    <div className="flex items-center gap-2">
      {showIndex && (
        <span className="text-white/40 text-xs font-medium w-4 text-center flex-shrink-0">
          {index + 1}
        </span>
      )}
      
      {/* Smaller Thumbnail */}
      <div className="relative flex-shrink-0">
        <img 
          src={song.thumbnail} 
          alt={song.title} 
          className="w-8 h-8 rounded object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded transition-opacity duration-300 flex items-center justify-center">
          <Play size={10} className="text-white" fill="white" />
        </div>
      </div>
      
      {/* Compact Song Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate text-xs leading-tight mb-0.5">
          {song.title}
        </h4>
        <div className="flex items-center justify-between">
          <p className="text-white/60 truncate text-xs flex-1 mr-2">
            {song.channel}
          </p>
          <p className="text-white/40 text-xs flex-shrink-0">
            {song.duration}
          </p>
        </div>
      </div>
      
      {/* Smaller Save Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onSave(song); }}
        className={`p-1 rounded-full transition-all duration-300 flex-shrink-0 ${
          isSaved[song.id] 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
        }`}
      >
        {isSaved[song.id] ? <Heart size={10} fill="currentColor" /> : <Plus size={10} />}
      </button>
    </div>
  </div>
);

export default SongCard;