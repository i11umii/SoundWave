import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white';
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-slate-950 border-r border-slate-800 h-screen sticky top-0">
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <i className="fas fa-music text-xl"></i>
          </div>
          <span className="text-xl font-bold">SoundWave</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="mb-6">
          <Link to="/" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-2 ${isActive('/')}`}>
            <i className="fas fa-home w-5"></i>
            <span className="font-medium">Home</span>
          </Link>
          
          {/* NEW: Live Feed */}
          <Link to="/live" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-2 ${isActive('/live')}`}>
            <div className="relative">
              <i className="fas fa-broadcast-tower w-5"></i>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <span className="font-medium">Live Now</span>
          </Link>

          {/* NEW: Music DNA */}
          <Link to="/music-dna" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-2 ${isActive('/music-dna')}`}>
            <i className="fas fa-dna w-5"></i>
            <span className="font-medium">Music DNA</span>
          </Link>

          {/* NEW: Smart Stats */}
          <Link to="/smart-stats" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-2 ${isActive('/smart-stats')}`}>
            <i className="fas fa-chart-line w-5"></i>
            <span className="font-medium">Smart Stats</span>
          </Link>

          <div className="my-4 border-t border-slate-800"></div>

          <Link to="/playlists" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-2 ${isActive('/playlists')}`}>
            <i className="fas fa-list-ul w-5"></i>
            <span className="font-medium">Playlists</span>
          </Link>
          <Link to="/liked-songs" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-2 ${isActive('/liked-songs')}`}>
            <i className="fas fa-heart w-5"></i>
            <span className="font-medium">Liked Songs</span>
          </Link>
          <Link to="/recently-played" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/recently-played')}`}>
            <i className="fas fa-clock w-5"></i>
            <span className="font-medium">Recently Played</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
          <i className="fas fa-user-circle text-2xl text-slate-400"></i>
          <span className="text-sm">Profile</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;