import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { playlistAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

const PlaylistPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamePlaylistId, setRenamePlaylistId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePlaylistId, setDeletePlaylistId] = useState(null);



  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    color: 'blue',
    icon: 'fa-music',
  });

  const colors = ['blue', 'green', 'red', 'purple', 'pink', 'orange', 'yellow', 'indigo'];
  const icons = ['fa-music', 'fa-heart', 'fa-fire', 'fa-star', 'fa-moon', 'fa-sun', 'fa-bolt', 'fa-leaf'];

  useEffect(() => {
    console.log('PlaylistPage: mount');
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    console.log('PlaylistPage: fetchPlaylists start');
    setLoading(true);

    try {
      const response = await playlistAPI.getAll();

      let items = [];
      if (response && response.data && response.data.data) {
        items = response.data.data;
      }

      console.log('PlaylistPage: playlists loaded', items.length);
      setPlaylists(items);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      console.log('PlaylistPage: fetchPlaylists end');
    }
  };

  const handleOpenCreateModal = () => {
    console.log('PlaylistPage: open create modal');
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    console.log('PlaylistPage: close create modal');
    setShowCreateModal(false);
  };

  const handleNameChange = (e) => {
    const next = {
      name: e.target.value,
      description: newPlaylist.description,
      color: newPlaylist.color,
      icon: newPlaylist.icon,
    };
    setNewPlaylist(next);
  };

  const handleDescriptionChange = (e) => {
    const next = {
      name: newPlaylist.name,
      description: e.target.value,
      color: newPlaylist.color,
      icon: newPlaylist.icon,
    };
    setNewPlaylist(next);
  };

  const handleSelectColor = (color) => {
    const next = {
      name: newPlaylist.name,
      description: newPlaylist.description,
      color: color,
      icon: newPlaylist.icon,
    };
    setNewPlaylist(next);
  };

  const handleSelectIcon = (icon) => {
    const next = {
      name: newPlaylist.name,
      description: newPlaylist.description,
      color: newPlaylist.color,
      icon: icon,
    };
    setNewPlaylist(next);
  };

  const resetCreateForm = () => {
    setNewPlaylist({
      name: '',
      description: '',
      color: 'blue',
      icon: 'fa-music',
    });
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();

    console.log('PlaylistPage: handleCreatePlaylist', newPlaylist.name);

    try {
      const response = await playlistAPI.create(newPlaylist);

      let created = null;
      if (response && response.data && response.data.data) {
        created = response.data.data;
      }

      if (created) {
        setPlaylists((prev) => {
          const next = [];
          for (let i = 0; i < prev.length; i += 1) {
            next.push(prev[i]);
          }
          next.push(created);
          return next;
        });
      }

      handleCloseCreateModal();
      resetCreateForm();
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggleMenu = (playlistId) => {
    console.log('PlaylistPage: toggle menu', playlistId);

    if (openMenuId === playlistId) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(playlistId);
    }
  };

  const handleOpenRenameModal = (playlistId, currentName) => {
    console.log('PlaylistPage: open rename modal', playlistId);

    setOpenMenuId(null);
    setRenamePlaylistId(playlistId);
    setRenameValue(currentName);
    setShowRenameModal(true);
  };

  const handleCloseRenameModal = () => {
    console.log('PlaylistPage: close rename modal');

    setShowRenameModal(false);
    setRenamePlaylistId(null);
    setRenameValue('');
  };

  const handleRenameValueChange = (e) => {
    setRenameValue(e.target.value);
  };

  const handleConfirmRename = async () => {
    if (!renamePlaylistId) {
      return;
    }

    const trimmed = String(renameValue).trim();
    if (!trimmed) {
      alert('Name cannot be empty');
      return;
    }

    console.log('PlaylistPage: confirm rename', renamePlaylistId, trimmed);

    try {
      await playlistAPI.rename(renamePlaylistId, trimmed);

      setPlaylists((prev) => {
        const next = [];

        for (let i = 0; i < prev.length; i += 1) {
          const item = prev[i];

          if (item && item._id === renamePlaylistId) {
            const updated = {
              ...item,
              name: trimmed,
            };
            next.push(updated);
          } else {
            next.push(item);
          }
        }

        return next;
      });

      handleCloseRenameModal();
    } catch (error) {
      console.log(error);
      alert('Error renaming playlist');
    }
  };

  const handleOpenDeleteModal = (playlistId) => {
    console.log('PlaylistPage: open delete modal', playlistId);

    setOpenMenuId(null);
    setDeletePlaylistId(playlistId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    console.log('PlaylistPage: close delete modal');

    setShowDeleteModal(false);
    setDeletePlaylistId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletePlaylistId) {
      return;
    }

    console.log('PlaylistPage: confirm delete', deletePlaylistId);

    try {
      await playlistAPI.delete(deletePlaylistId);

      setPlaylists((prev) => {
        const next = [];

        for (let i = 0; i < prev.length; i += 1) {
          const item = prev[i];
          if (item && item._id !== deletePlaylistId) {
            next.push(item);
          }
        }

        return next;
      });

      handleCloseDeleteModal();
    } catch (error) {
      console.log(error);
      alert('Error deleting playlist');
    }
  };



  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  let playlistCountText = '';
  if (playlists.length === 1) {
    playlistCountText = 'playlist';
  } else {
    playlistCountText = 'playlists';
  }

  let playlistsBlock = null;
  if (playlists.length === 0) {
    playlistsBlock = (
      <div className="text-center py-20 bg-gray-900/70 border border-gray-800 rounded-2xl">
        <i className="fas fa-list text-6xl text-gray-700 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
        <p className="text-gray-400 mb-6">Create your first playlist to organize your music.</p>
        <button
          onClick={handleOpenCreateModal}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg inline-flex items-center gap-2"
        >
          <i className="fas fa-plus" />
          <span>Create Playlist</span>
        </button>
      </div>
    );
  } else {
    playlistsBlock = (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {playlists.map((playlist) => {
          let tracksCount = 0;
          if (playlist && playlist.tracks && Array.isArray(playlist.tracks)) {
            tracksCount = playlist.tracks.length;
          }

          return (
            <div
              key={playlist._id}
              className="card-hover bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 transition-all group relative"
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
                <p className="text-xs text-gray-400 truncate mb-2">{playlist.description || 'No description'}</p>
                <p className="text-xs text-gray-500">{tracksCount} songs</p>
              </Link>

              <div className="mt-2 flex justify-end">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleMenu(playlist._id);
                    }}
                    className="text-gray-400 hover:text-white transition-colors p-2 opacity-0 group-hover:opacity-100"
                    aria-label="Playlist menu"
                  >
                    <i className="fas fa-ellipsis-h" />
                  </button>

                  {openMenuId === playlist._id ? (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenRenameModal(playlist._id, playlist.name);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-200 hover:bg-gray-800 rounded-lg flex items-center gap-2"
                      >
                        <i className="fas fa-pen" />
                        <span>Rename</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenDeleteModal(playlist._id);
                        }}
                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg flex items-center gap-2"
                      >
                        <i className="fas fa-trash" />
                        <span>Delete</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>


            </div>
          );
        })}
      </div>
    );
  }

  let createModalBlock = null;
  if (showCreateModal) {
    createModalBlock = (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Create Playlist</h2>
            <button
              onClick={handleCloseCreateModal}
              className="text-gray-400 hover:text-gray-200"
            >
              <i className="fas fa-times text-lg" />
            </button>
          </div>

          <form onSubmit={handleCreatePlaylist} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Playlist Name</label>
              <input
                type="text"
                value={newPlaylist.name}
                onChange={handleNameChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                placeholder="My Awesome Playlist"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={newPlaylist.description}
                onChange={handleDescriptionChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                rows="3"
                placeholder="What's this playlist about?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
              <div className="grid grid-cols-8 gap-2">
                {colors.map((color) => {
                  const isSelected = newPlaylist.color === color;
                  const ringClass = isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : '';

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleSelectColor(color)}
                      className={`w-8 h-8 rounded-full bg-${color}-500 hover:scale-110 transition-transform ${ringClass}`}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
              <div className="grid grid-cols-8 gap-2">
                {icons.map((icon) => {
                  const isSelected = newPlaylist.icon === icon;
                  const ringClass = isSelected ? 'ring-2 ring-blue-500' : '';

                  return (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => handleSelectIcon(icon)}
                      className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors ${ringClass}`}
                    >
                      <i className={`fas ${icon} text-xs text-gray-400`} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCloseCreateModal}
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
    );
  }
  let renameModalBlock = null;
  if (showRenameModal) {
    renameModalBlock = (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Rename Playlist</h2>
            <button
              onClick={handleCloseRenameModal}
              className="text-gray-400 hover:text-gray-200"
            >
              <i className="fas fa-times text-lg" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New name</label>
              <input
                type="text"
                value={renameValue}
                onChange={handleRenameValueChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                placeholder="Playlist name"
                autoFocus
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCloseRenameModal}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRename}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-colors text-sm font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let deleteModalBlock = null;
  if (showDeleteModal) {
    deleteModalBlock = (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Delete Playlist</h2>
            <button
              onClick={handleCloseDeleteModal}
              className="text-gray-400 hover:text-gray-200"
            >
              <i className="fas fa-times text-lg" />
            </button>
          </div>

          <p className="text-gray-300 text-sm mb-6">
            Are you sure you want to delete this playlist? This action cannot be undone.
          </p>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleCloseDeleteModal}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmDelete}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-semibold"
            >
              Delete
            </button>
          </div>
        </div>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Your Playlists
                </h1>
                <p className="text-gray-400 text-sm">
                  {playlists.length} {playlistCountText} in your library
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
              >
                <i className="fas fa-plus" />
                <span>Create Playlist</span>
              </button>
            </div>

            {playlistsBlock}
          </div>
        </main>
      </div>

      {createModalBlock}
      {renameModalBlock}
      {deleteModalBlock}
    </div>
  );
};

export default PlaylistPage;
