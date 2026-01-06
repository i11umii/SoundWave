import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

function TopNav() {
  const navigate = useNavigate();

  const auth = useAuth();
  const user = auth.user;
  const logout = auth.logout;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ tracks: [], artists: [] });
  const [showResults, setShowResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    console.log('TopNav: mount');

    function handleClickOutside(event) {
      const searchEl = searchRef.current;
      if (searchEl && !searchEl.contains(event.target)) {
        setShowResults(false);
      }

      const profileEl = profileRef.current;
      if (profileEl && !profileEl.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();

    const timer = setTimeout(() => {
      if (query.length === 0) {
        setSearchResults({ tracks: [], artists: [] });
        setShowResults(false);
        return;
      }

      fetchSearchResults(query);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  async function fetchSearchResults(query) {
    console.log('TopNav: search start', query);

    try {
      const response = await userAPI.search(query);

      let data = { tracks: [], artists: [] };
      if (response && response.data && response.data.data) {
        data = response.data.data;
      }

      setSearchResults(data);
      setShowResults(true);
      console.log('TopNav: search done', query);
    } catch (error) {
      console.log(error);
    }
  }

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearchQuery(value);
  }

  function handleTrackClick(trackId) {
    console.log('TopNav: track click', trackId);
    navigate(`/track/${trackId}/timeline`);
    setShowResults(false);
    setSearchQuery('');
  }

  function handleArtistClick(artistId) {
    console.log('TopNav: artist click', artistId);
    navigate(`/artist/${artistId}`);
    setShowResults(false);
    setSearchQuery('');
  }

  function handleLogout() {
    console.log('TopNav: logout');
    logout();
    navigate('/login');
  }

  function handleToggleProfileMenu() {
    console.log('TopNav: toggle profile menu');
    setShowProfileMenu(!showProfileMenu);
  }

  function getInitials() {
    let name = 'SW';
    if (user && user.username) {
      name = user.username;
    }

    return name.substring(0, 2).toUpperCase();
  }

  const hasTracks = searchResults.tracks && searchResults.tracks.length > 0;
  const hasArtists = searchResults.artists && searchResults.artists.length > 0;
  const hasAnyResults = hasTracks || hasArtists;

  let searchDropdownBlock = null;
  if (showResults && hasAnyResults) {
    let tracksBlock = null;
    if (hasTracks) {
      tracksBlock = (
        <div className="p-2">
          <h3 className="text-xs uppercase text-gray-400 font-semibold px-4 py-2">Tracks</h3>
          {searchResults.tracks.map((track) => (
            <button
              key={track._id}
              type="button"
              onClick={() => handleTrackClick(track._id)}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
            >
              <img src={track.imageUrl} alt={track.title} className="w-12 h-12 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{track.title}</p>
                <p className="text-xs text-gray-400 truncate">{track.artist?.name}</p>
              </div>
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{track.genre}</span>
            </button>
          ))}
        </div>
      );
    }

    let artistsBlock = null;
    if (hasArtists) {
      artistsBlock = (
        <div className="p-2 border-t border-gray-700">
          <h3 className="text-xs uppercase text-gray-400 font-semibold px-4 py-2">Artists</h3>
          {searchResults.artists.map((artist) => (
            <button
              key={artist._id}
              type="button"
              onClick={() => handleArtistClick(artist._id)}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
            >
              <img src={artist.imageUrl} alt={artist.name} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{artist.name}</p>
                <p className="text-xs text-gray-400">Artist</p>
              </div>
            </button>
          ))}
        </div>
      );
    }

    searchDropdownBlock = (
      <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
        {tracksBlock}
        {artistsBlock}
      </div>
    );
  }

  let noResultsBlock = null;
  if (showResults && !hasAnyResults && searchQuery.trim()) {
    noResultsBlock = (
      <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 text-center">
        <i className="fas fa-search text-4xl text-gray-600 mb-3"></i>
        <p className="text-gray-400">No results found for &quot;{searchQuery}&quot;</p>
      </div>
    );
  }

  let profileMenuBlock = null;
  if (showProfileMenu) {
    profileMenuBlock = (
      <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <p className="text-sm font-semibold text-white truncate">{user?.username || 'User'}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email || 'user@soundwave.com'}</p>
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
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 rounded-lg transition-colors text-left"
          >
            <i className="fas fa-sign-out-alt w-5 text-red-400"></i>
            <span className="text-sm text-red-400">Logout</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-8 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4">
        <div className="w-12"></div>

        <div ref={searchRef} className="relative w-full max-w-2xl">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search for songs, artists..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {searchDropdownBlock}
          {noResultsBlock}
        </div>

        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={handleToggleProfileMenu}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center hover:scale-105 transition-transform neon-glow"
          >
            <span className="text-white font-bold text-sm">{getInitials()}</span>
          </button>
          {profileMenuBlock}
        </div>
      </div>
    </header>
  );
}

export default TopNav;