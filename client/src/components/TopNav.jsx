import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const TopNav = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ tracks: [], artists: [] });
  const [showResults, setShowResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults({ tracks: [], artists: [] });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      const response = await userAPI.search(searchQuery);
      setSearchResults(response.data.data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleTrackClick = (trackId) => {
    navigate(`/track/${trackId}/timeline`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleArtistClick = (artistId) => {
    navigate(`/artist/${artistId}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    const name = user?.username || 'SW';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-8 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4">
        {/* Left spacer */}
        <div className="w-12"></div>

        {/* Search Bar - centered */}
        <div ref={searchRef} className="relative w-full max-w-2xl">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search for songs, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Search Results Dropdown */}
          {showResults && (searchResults.tracks.length > 0 || searchResults.artists.length > 0) && (
            <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
              {searchResults.tracks.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs uppercase text-gray-400 font-semibold px-4 py-2">
                    Tracks
                  </h3>
                  {searchResults.tracks.map((track) => (
                    <button
                      key={track._id}
                      onClick={() => handleTrackClick(track._id)}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
                    >
                      <img
                        src={track.imageUrl}
                        alt={track.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {track.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {track.artist?.name}
                        </p>
                      </div>
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {track.genre}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.artists.length > 0 && (
                <div className="p-2 border-t border-gray-700">
                  <h3 className="text-xs uppercase text-gray-400 font-semibold px-4 py-2">
                    Artists
                  </h3>
                  {searchResults.artists.map((artist) => (
                    <button
                      key={artist._id}
                      onClick={() => handleArtistClick(artist._id)}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
                    >
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {artist.name}
                        </p>
                        <p className="text-xs text-gray-400">Artist</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {showResults && searchResults.tracks.length === 0 && searchResults.artists.length === 0 && searchQuery.trim() && (
            <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 text-center">
              <i className="fas fa-search text-4xl text-gray-600 mb-3"></i>
              <p className="text-gray-400">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Profile Menu - right side */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center hover:scale-105 transition-transform neon-glow"
          >
            <span className="text-white font-bold text-sm">{getInitials()}</span>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email || 'user@soundwave.com'}
                </p>
              </div>

              <div className="p-2">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <i className="fas fa-user w-5 text-gray-400"></i>
                  <span className="text-sm text-white">Profile</span>
                </Link>

                <Link
                  to="/music-dna"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <i className="fas fa-dna w-5 text-purple-400"></i>
                  <span className="text-sm text-white">Music DNA</span>
                </Link>
              </div>

              <div className="p-2 border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                  <i className="fas fa-sign-out-alt w-5 text-red-400"></i>
                  <span className="text-sm text-red-400">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;