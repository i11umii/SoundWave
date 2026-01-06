import React, { useEffect, useState } from 'react';
import { playlistAPI } from '../utils/api';

function AddToPlaylistModal(props) {
  const trackId = props.trackId;
  const onClose = props.onClose;

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creatingLoading, setCreatingLoading] = useState(false);

  useEffect(() => {
    console.log('AddToPlaylistModal: mount');
    fetchPlaylists();
  }, []);

  async function fetchPlaylists() {
    console.log('AddToPlaylistModal: fetch playlists');
    setLoading(true);

    try {
      const res = await playlistAPI.getAll();
      if (res && res.data && res.data.data) {
        setPlaylists(res.data.data);
      } else {
        setPlaylists([]);
      }
            let count = 0;
      if (res && res.data && Array.isArray(res.data.data)) {
        count = res.data.data.length;
      }
      console.log('AddToPlaylistModal: playlists loaded', count);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick() {
    console.log('AddToPlaylistModal: backdrop click');
    if (onClose) {
      onClose();
    }
  }

  function handleModalClick(e) {
    e.stopPropagation();
  }

  function handleStartCreating() {
    console.log('AddToPlaylistModal: start creating');
    setIsCreating(true);
  }

  function handleCancelCreating() {
    console.log('AddToPlaylistModal: cancel creating');
    setIsCreating(false);
    setNewPlaylistName('');
  }

  function handleNewPlaylistNameChange(e) {
    const value = e.target.value;
    setNewPlaylistName(value);
  }

  async function handleAddToPlaylist(playlistId) {
    console.log('AddToPlaylistModal: add track', trackId, 'to', playlistId);

    try {
      await playlistAPI.addTrack(playlistId, trackId);
      alert('Track added to playlist!');
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.log(err);

      let msg = 'Error adding track';
      if (err && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      alert(msg);
    }
  }

  async function handleCreateAndAdd(e) {
    e.preventDefault();

    if (!newPlaylistName.trim()) {
      return;
    }

    console.log('AddToPlaylistModal: create playlist and add track', newPlaylistName);
    setCreatingLoading(true);

    try {
      const createRes = await playlistAPI.create({
        name: newPlaylistName,
        description: 'Created via quick add',
        color: 'blue',
        icon: 'fa-bolt',
      });

      let newPlaylistId = null;
      if (createRes && createRes.data && createRes.data.data && createRes.data.data._id) {
        newPlaylistId = createRes.data.data._id;
      }

      if (!newPlaylistId) {
        alert('Error creating playlist');
        return;
      }

      await playlistAPI.addTrack(newPlaylistId, trackId);

      alert(`Playlist "${newPlaylistName}" created and track added!`);
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.log(err);
      alert('Error creating playlist');
    } finally {
      setCreatingLoading(false);
    }
  }

  let createBlock = null;
  if (!isCreating) {
    createBlock = (
      <button
        type="button"
        onClick={handleStartCreating}
        className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
      >
        <i className="fas fa-plus-circle"></i> Create New Playlist
      </button>
    );
  } else {
    let createButtonContent = 'Add';
    if (creatingLoading) {
      createButtonContent = <i className="fas fa-spinner fa-spin"></i>;
    }

    createBlock = (
      <form onSubmit={handleCreateAndAdd} className="flex gap-2">
        <input
          type="text"
          autoFocus
          placeholder="Playlist name"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          value={newPlaylistName}
          onChange={handleNewPlaylistNameChange}
        />

        <button
          type="submit"
          disabled={creatingLoading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {createButtonContent}
        </button>

        <button type="button" onClick={handleCancelCreating} className="text-gray-400 hover:text-white px-2">
          ✕
        </button>
      </form>
    );
  }

  let playlistsBlock = null;
  if (loading) {
    playlistsBlock = <div className="text-center py-4 text-gray-400">Loading playlists...</div>;
  } else if (playlists.length === 0) {
    playlistsBlock = <div className="text-center py-2 text-gray-500 text-sm">No existing playlists found.</div>;
  } else {
    playlistsBlock = (
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {playlists.map((playlist) => (
          <button
            key={playlist._id}
            type="button"
            onClick={() => handleAddToPlaylist(playlist._id)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
          >
            <div
              className={`w-10 h-10 rounded bg-gradient-to-br from-${playlist.color}-500 to-${playlist.color}-700 flex items-center justify-center`}
            >
              <i className={`fas ${playlist.icon} text-white`}></i>
            </div>
            <div className="min-w-0">
              <div className="text-gray-200 font-medium truncate">{playlist.name}</div>
              <div className="text-gray-500 text-xs">{playlist.tracks.length} tracks</div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]" onClick={handleBackdropClick}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm" onClick={handleModalClick}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add to Playlist</h2>
          <button type="button" onClick={handleBackdropClick} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="mb-4 border-b border-gray-800 pb-4">{createBlock}</div>

        {playlistsBlock}
      </div>
    </div>
  );
}

export default AddToPlaylistModal;