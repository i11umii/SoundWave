import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playlistAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

const PlaylistPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    color: 'blue',
    icon: 'fa-music'
  });

  const colors = ['blue', 'green', 'red', 'purple', 'pink', 'orange', 'yellow', 'indigo'];
  const icons = ['fa-music', 'fa-heart', 'fa-fire', 'fa-star', 'fa-moon', 'fa-sun', 'fa-bolt', 'fa-leaf'];

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await playlistAPI.getAll();
      setPlaylists(response.data.data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    try {
      const response = await playlistAPI.create(newPlaylist);
      setPlaylists([...playlists, response.data.data]);
      setShowCreateModal(false);
      setNewPlaylist({ name: '', description: '', color: 'blue', icon: 'fa-music' });
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      await playlistAPI.delete(id);
      setPlaylists(playlists.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">Your Playlists</h1>
                <p className="text-slate-400">
                  {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors"
              >
                <i className="fas fa-plus"></i>
                <span>Create Playlist</span>
              </button>
            </div>

            {/* Playlists Grid */}
            {playlists.length === 0 ? (
              <div className="text-center py-16">
                <i className="fas fa-list text-6xl text-slate-700 mb-4"></i>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  No playlists yet
                </h3>
                <p className="text-slate-400 mb-6">Create your first playlist to organize your music</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <i className="fas fa-plus"></i>
                  <span>Create Playlist</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {playlists.map((playlist) => (
                  <div
                    key={playlist._id}
                    className="bg-slate-800/50 hover:bg-slate-800 rounded-lg p-4 transition-all group"
                  >
                    <Link to={`/playlists/${playlist._id}`}>
                      <div className={`w-full aspect-square bg-gradient-to-br from-${playlist.color}-500 to-${playlist.color}-700 rounded-lg flex items-center justify-center mb-4 relative`}>
                        <i className={`fas ${playlist.icon} text-white text-5xl`}></i>
                        <button className="absolute bottom-2 right-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                          <i className="fas fa-play text-white text-sm ml-1"></i>
                        </button>
                      </div>
                      <h3 className="font-semibold mb-1 truncate">{playlist.name}</h3>
                      <p className="text-sm text-slate-400 truncate">{playlist.description}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {playlist.tracks?.length || 0} songs
                      </p>
                    </Link>
                    <button
                      onClick={() => handleDeletePlaylist(playlist._id)}
                      className="mt-2 text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create Playlist</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Playlist Name</label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Awesome Playlist"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="What's this playlist about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="grid grid-cols-8 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewPlaylist({ ...newPlaylist, color })}
                      className={`w-10 h-10 rounded-full bg-${color}-500 ${
                        newPlaylist.color === color ? 'ring-2 ring-white' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <div className="grid grid-cols-8 gap-2">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewPlaylist({ ...newPlaylist, icon })}
                      className={`w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center ${
                        newPlaylist.icon === icon ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <i className={`fas ${icon}`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;