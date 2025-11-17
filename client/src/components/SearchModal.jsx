import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { userAPI } from '../utils/api';

const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { setCurrentTrack, setPlaylist, play } = usePlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tracks: [], artists: [], playlists: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 0) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults({ tracks: [], artists: [], playlists: [] });
    }
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await userAPI.search(query);
      setResults(response.data.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackClick = (track) => {
    setPlaylist(results.tracks);
    setCurrentTrack(track);
    play();
    onClose();
  };

  const handleArtistClick = (artistId) => {
    navigate(`/artist/${artistId}`);
    onClose();
  };

  const handlePlaylistClick = (playlistId) => {
    navigate(`/playlists/${playlistId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20">
      <div className="bg-slate-800 rounded-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <i className="fas fa-search text-slate-400"></i>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="flex-1 bg-transparent text-white outline-none"
              autoFocus
            />
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="p-8 text-center">
              <i className="fas fa-spinner fa-spin text-2xl text-slate-400"></i>
            </div>
          ) : (
            <>
              {/* Tracks */}
              {results.tracks.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">TRACKS</h3>
                  {results.tracks.map((track) => (
                    <div
                      key={track._id}
                      onClick={() => handleTrackClick(track)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
                    >
                      <img src={track.imageUrl} alt={track.title} className="w-12 h-12 rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-slate-400 truncate">{track.artist?.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Artists */}
              {results.artists.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">ARTISTS</h3>
                  {results.artists.map((artist) => (
                    <div
                      key={artist._id}
                      onClick={() => handleArtistClick(artist._id)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
                    >
                      <img src={artist.imageUrl} alt={artist.name} className="w-12 h-12 rounded-full" />
                      <div>
                        <p className="font-medium">{artist.name}</p>
                        <p className="text-sm text-slate-400">Artist</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Playlists */}
              {results.playlists.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">PLAYLISTS</h3>
                  {results.playlists.map((playlist) => (
                    <div
                      key={playlist._id}
                      onClick={() => handlePlaylistClick(playlist._id)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br from-${playlist.color}-500 to-${playlist.color}-700 rounded flex items-center justify-center`}>
                        <i className={`fas ${playlist.icon} text-white`}></i>
                      </div>
                      <div>
                        <p className="font-medium">{playlist.name}</p>
                        <p className="text-sm text-slate-400">By {playlist.user?.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {query && !loading && results.tracks.length === 0 && results.artists.length === 0 && results.playlists.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <i className="fas fa-search text-4xl mb-3 opacity-50"></i>
                  <p>No results found for "{query}"</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;