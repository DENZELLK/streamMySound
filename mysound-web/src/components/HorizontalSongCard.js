import React from 'react';
import { Play, Heart, Plus } from 'lucide-react';

const HorizontalSongCard = ({ song, onPlay, onSave, isSaved, onAddToQueue }) => {
  const handlePlayClick = (e) => {
    e.stopPropagation();
    onPlay(song);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    onSave(song);
  };

  return (
    <div 
      className="group bg-white/5 backdrop-blur-lg rounded-xl p-3 hover:bg-white/10 transition-all duration-300 cursor-pointer border border-white/10 hover:border-purple-500/30 w-full"
      onClick={handlePlayClick}
    >
      <div className="relative mb-2">
        <img 
          src={song.thumbnail} 
          alt={song.title} 
          className="w-full aspect-square object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300 flex items-center justify-center">
          <Play size={20} className="text-white" fill="white" />
        </div>
        <button 
          onClick={handleSaveClick}
          className={`absolute top-1.5 right-1.5 p-1 rounded-full transition-all duration-300 ${
            isSaved[song.id] 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-black/60 text-white/80 hover:bg-green-500 hover:text-white'
          }`}
        >
          {isSaved[song.id] ? <Heart size={12} fill="currentColor" /> : <Plus size={12} />}
        </button>
      </div>
      <h4 className="text-white font-semibold text-xs truncate mb-1">{song.title}</h4>
      <p className="text-white/60 text-xs truncate">{song.channel}</p>
      <p className="text-white/40 text-xs mt-1">{song.duration}</p>
    </div>
  );
};

export default HorizontalSongCard;
