import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

const SearchBar = ({ query, setQuery, searchMusic, loading, searchInputRef }) => {
  return (
    <div className="flex gap-3 mb-8 max-w-2xl mx-auto">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
        <input
          ref={searchInputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs, artists..."
          className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-lg rounded-2xl text-white placeholder-white/40 border border-white/10 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 outline-none text-sm"
          onKeyPress={(e) => e.key === 'Enter' && searchMusic()}
        />
      </div>
      <button 
        onClick={searchMusic} 
        className="px-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        disabled={loading || !query.trim()}
      >
        {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Search'}
      </button>
    </div>
  );
};

export default SearchBar;