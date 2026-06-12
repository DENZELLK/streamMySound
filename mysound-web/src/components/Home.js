import React, { useState } from 'react';
import SearchBar from './SearchBar';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import SongCard from './SongCard';
import HorizontalSongCard from './HorizontalSongCard';
import AuthModal from './AuthModal';
import Toast from './Toast';
import { TrendingUp, Clock, Heart, Music } from 'lucide-react';

const Home = ({
  query,
  setQuery,
  searchMusic,
  loading,
  apiError,
  retryApiCall,
  searchResults,
  recentlyPlayed,
  playlist,
  libraryCount,
  isSaved,
  playSong,
  saveSong,
  searchInputRef,
  setApiError,
  onAddToQueue,
  isMobile,
  isAuthenticated
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleSaveSong = async (song) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
   
    if (isSaved[song.id]) {
      showToast('Song is already in your library', 'info');
      return;
    }
    
    try {
      await saveSong(song);
      showToast('Song added to library!', 'success');
    } catch (error) {
      showToast('Failed to add song to library', 'error');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header - This stays at the top of the Home component */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl border-b border-white/10 flex-shrink-0">
        <div className="p-4 pb-2">
          <SearchBar
            query={query}
            setQuery={setQuery}
            searchMusic={searchMusic}
            loading={loading}
            searchInputRef={searchInputRef}
          />
          
          <ErrorMessage 
            error={apiError} 
            onDismiss={() => setApiError(null)} 
            onRetry={retryApiCall} 
          />
        </div>
      </div>

      {/* Scrollable Content - With proper bottom padding for PlayerControls */}
      <div className="flex-1 overflow-y-auto pb-24"> {/* Added pb-24 for player controls space */}
        <div className="p-4">
          {loading && (
            <div className="flex justify-center py-6">
              <LoadingSpinner />
            </div>
          )}

          <div className="space-y-6">
            {/* Search Results */}
            {searchResults.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <TrendingUp size={18} className="text-purple-400" />
                  Search Results
                </h2>
                <div className="grid gap-2">
                  {searchResults.slice(0, 10).map((song, i) => (
                    <SongCard 
                      key={song.id} 
                      song={song} 
                      index={i} 
                      showIndex={true}
                      onPlay={playSong}
                      onSave={handleSaveSong}
                      isSaved={isSaved}
                      onAddToQueue={onAddToQueue}
                      compact={true}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recently Played - Horizontal Scroll */}
            <section>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Clock size={18} className="text-purple-400" />
                Recently Played
              </h2>
              {recentlyPlayed.length > 0 ? (
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                    {recentlyPlayed.map((song, i) => (
                      <div key={i} className="flex-shrink-0 w-32">
                        <HorizontalSongCard 
                          song={song} 
                          onPlay={playSong}
                          onSave={handleSaveSong}
                          isSaved={isSaved}
                          onAddToQueue={onAddToQueue}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-white/60 text-xs">
                  No recently played songs yet. Start playing some music!
                </div>
              )}
            </section>

            {/* Saved Songs - Horizontal Scroll */}
            {playlist.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Heart size={18} className="text-purple-400" fill="currentColor" />
                  Your Library
                  <span className="text-xs text-white/40 font-normal ml-1">({libraryCount})</span>
                </h2>
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                    {playlist.slice(0, 8).map((song, i) => (
                      <div key={i} className="flex-shrink-0 w-32">
                        <HorizontalSongCard 
                          song={song} 
                          onPlay={playSong}
                          onSave={handleSaveSong}
                          isSaved={isSaved}
                          onAddToQueue={onAddToQueue}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Empty State */}
            {!loading && searchResults.length === 0 && playlist.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Music size={20} className="text-white/30" />
                </div>
                <h3 className="text-white text-base font-semibold mb-1">No music yet</h3>
                <p className="text-white/60 max-w-md mx-auto text-xs">
                  Search for songs to start building your music library
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          toast={toast}
          position="bottom"
        />
      )}
    </div>
  );
};

export default Home;