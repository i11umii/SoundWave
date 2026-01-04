import React, { useState, useEffect } from 'react';
import { playlistAPI } from '../utils/api';

const AddToPlaylistModal = ({ trackId, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // State для создания нового плейлиста
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creatingLoading, setCreatingLoading] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await playlistAPI.getAll();
      setPlaylists(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await playlistAPI.addTrack(playlistId, trackId);
      onClose();
      alert('Track added to playlist!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding track');
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setCreatingLoading(true);
    try {
      // 1. Создаем плейлист
      const createRes = await playlistAPI.create({
        name: newPlaylistName,
        description: 'Created via quick add',
        color: 'blue',
        icon: 'fa-bolt'
      });

      const newPlaylistId = createRes.data.data._id;

      // 2. Сразу добавляем туда трек
      await playlistAPI.addTrack(newPlaylistId, trackId);

      onClose();
      alert(`Playlist "${newPlaylistName}" created and track added!`);
    } catch (err) {
      console.error(err);
      alert('Error creating playlist');
    } finally {
      setCreatingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add to Playlist</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Кнопка или Форма создания нового */}
        <div className="mb-4 border-b border-gray-800 pb-4">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
            >
              <i className="fas fa-plus-circle"></i> Create New Playlist
            </button>
          ) : (
            <form onSubmit={handleCreateAndAdd} className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Playlist name"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
              <button
                type="submit"
                disabled={creatingLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {creatingLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-white px-2"
              >
                ✕
              </button>
            </form>
          )}
        </div>

        {loading ? (
          <div className="text-center py-4 text-gray-400">Loading playlists...</div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-2 text-gray-500 text-sm">No existing playlists found.</div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {playlists.map(playlist => (
              <button
                key={playlist._id}
                onClick={() => handleAddToPlaylist(playlist._id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded bg-gradient-to-br from-${playlist.color}-500 to-${playlist.color}-700 flex items-center justify-center`}>
                  <i className={`fas ${playlist.icon} text-white`}></i>
                </div>
                <div className="min-w-0">
                  <div className="text-gray-200 font-medium truncate">{playlist.name}</div>
                  <div className="text-gray-500 text-xs">{playlist.tracks.length} tracks</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddToPlaylistModal;