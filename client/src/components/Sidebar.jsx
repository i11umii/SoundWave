import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: 'fa-home', label: 'Home' },
    { path: '/tracks', icon: 'fa-music', label: 'Tracks' },
    { path: '/playlists', icon: 'fa-list', label: 'Playlists' },
    { path: '/liked-songs', icon: 'fa-heart', label: 'Liked Songs' },
    { path: '/recently-played', icon: 'fa-clock', label: 'Recent' },
  ];

  const features = [
    { path: '/music-dna', icon: 'fa-dna', label: 'Music DNA' },
  ];

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col h-full">
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center neon-glow group-hover:scale-105 transition-transform">
            <i className="fas fa-music text-white text-lg"></i>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SoundWave
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${location.pathname === item.path
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <i className={`fas ${item.icon} w-5 text-center`}></i>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Features</p>
          {features.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${location.pathname === item.path
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
            >
              <i className={`fas ${item.icon} w-5 text-center`}></i>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;