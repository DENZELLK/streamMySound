import React, { useState, useEffect } from 'react';
import { useMusicApi } from '../hooks/useApi';
import { auth } from '../firebase';
import { Music, Play, Trash2, Heart, Search, Filter, Grid, List } from 'lucide-react';

function Library({ playSong }) {
  const [savedSongs, setSavedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedSong, setSelectedSong] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
 
  const { getUserLibrary, removeSongFromLibrary, loading: apiLoading } = useMusicApi();

 
  const fetchLibrary = async () => {
    if (!auth.currentUser) {
      setSavedSongs([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await getUserLibrary();
      const songsWithTimestamp = (data.songs || []).map(song => ({
        ...song,
        addedAt: song.addedAt || new Date().toISOString()
      }));
      setSavedSongs(songsWithTimestamp);
    } catch (error) {
      console.error('Library fetch failed:', error);
     
      if (error.type === 'auth_error') {
        setError('Authentication failed. Please sign in again.');
      } else if (error.type === 'network' || error.type === 'timeout') {
        setError('Network connection failed. Please check your internet connection.');
      } else if (error.type === 'server_error') {
        setError('Server is temporarily unavailable. Please try again later.');
      } else {
        setError('Failed to load library. Please try again.');
      }
      setSavedSongs([]);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    let mounted = true;
    
    const loadLibrary = async () => {
      if (mounted && auth.currentUser) {
        await fetchLibrary();
      }
    };

    loadLibrary();

    return () => {
      mounted = false;
    };
  }, [auth.currentUser]); 

  
  const handleRetry = async () => {
    setError(null);
    await fetchLibrary();
  };

 
  const filteredAndSortedSongs = savedSongs
    .filter(song => 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.channel.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          return a.channel.localeCompare(b.channel);
        case 'recent':
          return new Date(b.addedAt) - new Date(a.addedAt);
        default:
          return 0;
      }
    });

  const removeSong = async (song) => {
    try {
      await removeSongFromLibrary(song.id);
      setSavedSongs(prev => prev.filter(s => s.id !== song.id));
      setShowDeleteModal(false);
      setSelectedSong(null);
    } catch (error) {
      console.error('Remove failed:', error);
      alert('Failed to remove song. Please try again.');
    }
  };

  const confirmRemove = (song) => {
    setSelectedSong(song);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    if (typeof duration === 'string') return duration;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

 
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl animate-pulse">
          <div className="w-16 h-16 bg-white/10 rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-3 bg-white/10 rounded w-1/2"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-white/10 rounded-full"></div>
            <div className="w-10 h-10 bg-white/10 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

 
  const ErrorState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
        <Music size={40} className="text-red-400" />
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">
        Failed to Load Library
      </h3>
      <p className="text-white/60 max-w-md mx-auto mb-6">
        {error}
      </p>
      <button
        onClick={handleRetry}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
      >
        Try Again
      </button>
    </div>
  );

 
  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {filteredAndSortedSongs.map((song, index) => (
        <div 
          key={song.id} 
          className="group music-card hover-lift relative overflow-hidden"
          onClick={() => playSong(song)}
        >
          <div className="relative">
            <img 
              src={song.thumbnail} 
              alt={song.title} 
              className="w-full aspect-square object-cover rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={(e) => { e.stopPropagation(); playSong(song); }}
                className="absolute bottom-3 left-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg"
              >
                <Play size={20} className="text-white ml-1" fill="white" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); confirmRemove(song); }}
                className="absolute bottom-3 right-3 w-12 h-12 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500/30 transition-colors duration-300"
              >
                <Trash2 size={18} className="text-red-400" />
              </button>
            </div>
            <div className="absolute top-3 right-3">
              <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-white text-xs font-medium">
                  {formatDuration(song.duration)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-white font-semibold truncate text-sm mb-1">
              {song.title}
            </h3>
            <p className="text-white/60 text-xs truncate mb-2">
              {song.channel}
            </p>
            <div className="flex items-center justify-between text-white/40 text-xs">
              <div className="flex items-center gap-1">
                <Heart size={12} className="text-red-400" fill="currentColor" />
                <span>Saved</span>
              </div>
              {song.addedAt && (
                <span>{formatDate(song.addedAt)}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  
  const ListView = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-4 px-4 py-3 text-white/60 text-sm font-medium border-b border-white/10">
        <div className="col-span-1">#</div>
        <div className="col-span-5">Title</div>
        <div className="col-span-3">Artist</div>
        <div className="col-span-2">Date Added</div>
        <div className="col-span-1 text-right">Duration</div>
      </div>

      {filteredAndSortedSongs.map((song, index) => (
        <div 
          key={song.id}
          className="grid grid-cols-12 gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all duration-300 group cursor-pointer"
          onClick={() => playSong(song)}
        >
          <div className="col-span-1 flex items-center">
            <span className="text-white/40 group-hover:hidden">{index + 1}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); playSong(song); }}
              className="hidden group-hover:flex items-center justify-center w-6 h-6"
            >
              <Play size={16} className="text-white" fill="white" />
            </button>
          </div>
          
          <div className="col-span-5 flex items-center gap-3">
            <img 
              src={song.thumbnail} 
              alt={song.title} 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-medium truncate text-sm">
                {song.title}
              </h4>
            </div>
          </div>
          
          <div className="col-span-3 flex items-center">
            <p className="text-white/60 truncate text-sm">
              {song.channel}
            </p>
          </div>
          
          <div className="col-span-2 flex items-center">
            <span className="text-white/40 text-sm">
              {song.addedAt ? formatDate(song.addedAt) : 'Recently'}
            </span>
          </div>
          
          <div className="col-span-1 flex items-center justify-end gap-2">
            <span className="text-white/40 text-sm">
              {formatDuration(song.duration)}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); confirmRemove(song); }}
              className="opacity-0 group-hover:opacity-100 p-2 text-white/60 hover:text-red-400 transition-all duration-300"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
              <Music size={32} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Your Library
              </h1>
              <p className="text-white/60">
                {savedSongs.length} saved songs • Your personal music collection
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="relative flex-1 max-w-2xl">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-lg rounded-2xl text-white placeholder-white/40 border border-white/10 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl py-3 pl-4 pr-10 text-white text-sm focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 outline-none"
              >
                <option value="recent">Recently Added</option>
                <option value="title">Title</option>
                <option value="artist">Artist</option>
              </select>
              <Filter size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>

            <div className="flex bg-white/5 backdrop-blur-lg rounded-2xl p-1 border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading || apiLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState />
      ) : filteredAndSortedSongs.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Music size={40} className="text-white/30" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">
            {searchQuery ? 'No songs found' : 'Your library is empty'}
          </h3>
          <p className="text-white/60 max-w-md mx-auto">
            {searchQuery 
              ? 'Try adjusting your search terms to find what you\'re looking for.'
              : 'Start building your collection by searching for songs and saving them to your library.'
            }
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <GridView />
      ) : (
        <ListView />
      )}

      {showDeleteModal && selectedSong && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900/90 to-purple-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-400" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">
                Remove from Library?
              </h3>
              <p className="text-white/60">
                Are you sure you want to remove "<span className="text-white font-medium">{selectedSong.title}</span>" from your library?
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => removeSong(selectedSong)}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-2xl transition-all duration-300"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Library;