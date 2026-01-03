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
    icon: 'fa-music',
  });

  const colors = ['blue', 'green', 'red', 'purple', 'pink', 'orange', 'yellow', 'indigo'];
  const icons = ['fa-music', 'fa-heart', 'fa-fire', 'fa-star', 'fa-moon', 'fa-sun', 'fa-bolt', 'fa-leaf'];

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await playlistAPI.getAll();
      setPlaylists(response.data.data || []);
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
      setPlaylists((prev) => [...prev, response.data.data]);
      setShowCreateModal(false);
      setNewPlaylist({
        name: '',
        description: '',
        color: 'blue',
        icon: 'fa-music',
      });
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await playlistAPI.delete(id);
      setPlaylists((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          <div className="px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Your Playlists
                </h1>
                <p className="text-gray-400 text-sm">
                  {playlists.length}{' '}
                  {playlists.length === 1 ? 'playlist' : 'playlists'} in your library
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
              >
                <i className="fas fa-plus" />
                <span>Create Playlist</span>
              </button>
            </div>

            {/* Playlists Grid */}
            {playlists.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/70 border border-gray-800 rounded-2xl">
                <i className="fas fa-list text-6xl text-gray-700 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
                <p className="text-gray-400 mb-6">
                  Create your first playlist to organize your music.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg inline-flex items-center gap-2"
                >
                  <i className="fas fa-plus" />
                  <span>Create Playlist</span>
                </button>
              </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {playlists.map((playlist) => (
                  <div
                    key={playlist._id}
                    className="card-hover bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 transition-all group"
                  >
                    <Link to={`/playlists/${playlist._id}`}>
                      <div
                        className={`w-full aspect-square bg-gradient-to-br from-${playlist.color}-500 to-${playlist.color}-700 rounded-lg flex items-center justify-center mb-4 relative`}
                      >
                        <i className={`fas ${playlist.icon} text-white text-4xl`} />
                        <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                          <i className="fas fa-play text-xs ml-0.5" />
                        </button>
                      </div>
                      <h3 className="font-semibold text-white mb-1 truncate">{playlist.name}</h3>
                      <p className="text-xs text-gray-400 truncate mb-2">
                        {playlist.description || 'No description'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {playlist.tracks?.length || 0} songs
                      </p>
                    </Link>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeletePlaylist(playlist._id);
                      }}
                      className="mt-2 text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1"
                    >
                      <i className="fas fa-trash-alt" />
                      <span>Delete</span>
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create Playlist</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <i className="fas fa-times text-lg" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) =>
                    setNewPlaylist((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                  placeholder="My Awesome Playlist"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) =>
                    setNewPlaylist((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                  rows="3"
                  placeholder="What's this playlist about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setNewPlaylist((prev) => ({ ...prev, color }))
                      }
                      className={`w-8 h-8 rounded-full bg-${color}-500 hover:scale-110 transition-transform ${newPlaylist.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() =>
                        setNewPlaylist((prev) => ({ ...prev, icon }))
                      }
                      className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors ${
                        newPlaylist.icon === icon ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <i className={`fas ${icon} text-xs text-gray-400`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-colors text-sm font-semibold"
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