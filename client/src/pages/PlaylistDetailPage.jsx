import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { playlistAPI, userAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';

const PlaylistDetailPage = () => {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();

  const auth = useAuth();
  const player = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [likedTrackIds, setLikedTrackIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    console.log('PlaylistDetailPage: mount / id changed', id);
    fetchPlaylist();
    fetchLikedTracks();
  }, [id]);

  const fetchPlaylist = async () => {
    console.log('PlaylistDetailPage: fetchPlaylist start', id);
    setLoading(true);

    try {
      const response = await playlistAPI.getById(id);

      let data = null;
      if (response && response.data && response.data.data) {
        data = response.data.data;
      }

      setPlaylist(data);
      console.log('PlaylistDetailPage: playlist loaded', data ? data._id : null);
    } catch (error) {
      console.log(error);
      setPlaylist(null);
    } finally {
      setLoading(false);
      console.log('PlaylistDetailPage: fetchPlaylist end');
    }
  };

  const fetchLikedTracks = async () => {
    console.log('PlaylistDetailPage: fetchLikedTracks start');

    try {
      const response = await userAPI.getLikedTracks();

      const ids = [];
      if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        for (let i = 0; i < response.data.data.length; i += 1) {
          const t = response.data.data[i];
          if (t && t._id) {
            ids.push(t._id);
          }
        }
      }

      setLikedTrackIds(ids);
      console.log('PlaylistDetailPage: liked tracks loaded', ids.length);
    } catch (error) {
      console.log(error);
    }
  };

  const getTracksFromPlaylist = () => {
    const tracks = [];

    if (!playlist) {
      return tracks;
    }

    if (!playlist.tracks || !Array.isArray(playlist.tracks)) {
      return tracks;
    }

    for (let i = 0; i < playlist.tracks.length; i += 1) {
      const item = playlist.tracks[i];
      if (item && item.track) {
        tracks.push(item.track);
      }
    }

    return tracks;
  };

  const handlePlayAll = () => {
    console.log('PlaylistDetailPage: handlePlayAll');

    const tracks = getTracksFromPlaylist();
    if (tracks.length === 0) {
      return;
    }

    player.setPlaylist(tracks);
    player.setCurrentTrack(tracks[0]);
    player.play();
  };

  const handlePlayTrack = (track) => {
    console.log('PlaylistDetailPage: handlePlayTrack', track ? track._id : null);

    const tracks = getTracksFromPlaylist();
    if (tracks.length === 0) {
      return;
    }

    player.setPlaylist(tracks);
    player.setCurrentTrack(track);
    player.play();
  };

  const handleRemoveTrack = async (trackId) => {
    console.log('PlaylistDetailPage: remove track', trackId);

    try {
      await playlistAPI.removeTrack(id, trackId);

      setPlaylist((prev) => {
        if (!prev) {
          return prev;
        }

        if (!prev.tracks || !Array.isArray(prev.tracks)) {
          return prev;
        }

        const nextTracks = [];
        for (let i = 0; i < prev.tracks.length; i += 1) {
          const item = prev.tracks[i];
          if (!item || !item.track) {
            continue;
          }
          if (item.track._id !== trackId) {
            nextTracks.push(item);
          }
        }

        const nextPlaylist = {
          ...prev,
          tracks: nextTracks,
        };

        return nextPlaylist;
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getTotalDurationSeconds = () => {
    let total = 0;

    if (!playlist) {
      return total;
    }

    if (!playlist.tracks || !Array.isArray(playlist.tracks)) {
      return total;
    }

    for (let i = 0; i < playlist.tracks.length; i += 1) {
      const item = playlist.tracks[i];
      if (!item || !item.track) {
        continue;
      }

      const duration = item.track.duration;
      if (typeof duration === 'number') {
        total += duration;
      }
    }

    return total;
  };

  const handleToggleMenu = () => {
    console.log('PlaylistDetailPage: toggle menu');

    if (showMenu) {
      setShowMenu(false);
    } else {
      setShowMenu(true);
    }
  };

  const handleDeletePlaylist = async () => {
    setShowMenu(false);

    const ok = window.confirm('Are you sure you want to delete this playlist?');
    if (!ok) {
      return;
    }

    console.log('PlaylistDetailPage: delete playlist', id);

    try {
      await playlistAPI.delete(id);
      navigate('/playlists');
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

  if (!playlist) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-gray-400">
        Playlist not found
      </div>
    );
  }

  const totalDuration = getTotalDurationSeconds();
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  const user = auth.user;

  let currentUserId = null;
  if (user) {
    currentUserId = user.id || user._id;
  }

  let ownerId = null;
  if (playlist.user) {
    if (typeof playlist.user === 'string') {
      ownerId = playlist.user;
    } else {
      ownerId = playlist.user._id || playlist.user.id;
    }
  }

  let isOwner = false;
  if (currentUserId && ownerId) {
    if (String(currentUserId) === String(ownerId)) {
      isOwner = true;
    }
  }

  console.log('PlaylistDetailPage: currentUserId =', currentUserId);
  console.log('PlaylistDetailPage: ownerId =', ownerId);
  console.log('PlaylistDetailPage: isOwner =', isOwner);

  let ownerName = 'You';
  if (playlist.user && typeof playlist.user !== 'string') {
    if (playlist.user.username) {
      ownerName = playlist.user.username;
    }
  }

  let tracksCount = 0;
  if (playlist.tracks && Array.isArray(playlist.tracks)) {
    tracksCount = playlist.tracks.length;
  }

  let durationBlock = null;
  if (totalDuration > 0) {
    let hoursText = '';
    if (hours > 0) {
      hoursText = `${hours} hr `;
    }

    durationBlock = (
      <>
        <span>•</span>
        <span>
          {hoursText}
          {minutes} min
        </span>
      </>
    );
  }

  let ownerMenuBlock = null;
  if (isOwner) {
    let dropdownBlock = null;
    if (showMenu) {
      dropdownBlock = (
        <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          <button
            onClick={handleDeletePlaylist}
            className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg flex items-center gap-2"
          >
            <i className="fas fa-trash" /> Delete Playlist
          </button>
        </div>
      );
    }

    ownerMenuBlock = (
      <div className="relative">
        <button onClick={handleToggleMenu} className="text-gray-400 hover:text-white transition-colors p-2">
          <i className="fas fa-ellipsis-h text-xl" />
        </button>
        {dropdownBlock}
      </div>
    );
  }

  const tracks = getTracksFromPlaylist();
  let tracksBlock = null;

  if (!playlist.tracks || !Array.isArray(playlist.tracks) || playlist.tracks.length === 0) {
    tracksBlock = (
      <div className="text-center py-16 bg-gray-900/70 border border-gray-800 rounded-2xl">
        <i className="fas fa-music text-6xl text-gray-700 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No tracks in this playlist</h3>
        <p className="text-gray-400">Add some tracks to start listening.</p>
      </div>
    );
  } else {
    tracksBlock = (
      <div className="space-y-1">
        {tracks.map((track, index) => {
          const key = `${track._id}-${index}`;

          let onRemoveFromPlaylist = null;
          if (isOwner) {
            onRemoveFromPlaylist = () => handleRemoveTrack(track._id);
          }

          return (
            <TrackItem
              key={key}
              track={track}
              index={index}
              onPlay={() => handlePlayTrack(track)}
              showAlbum={true}
              showArtist={true}
              isLiked={likedTrackIds.includes(track._id)}
              onRemoveFromPlaylist={onRemoveFromPlaylist}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          <div className="px-8 py-10 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-900 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              <div
                className={`w-40 h-40 rounded-xl bg-gradient-to-br from-${playlist.color}-500 to-${playlist.color}-700 flex items-center justify-center shadow-2xl neon-glow`}
              >
                <i className={`fas ${playlist.icon} text-white text-5xl`} />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Playlist</p>
                <h1 className="text-5xl font-bold mb-3 text-white">{playlist.name}</h1>
                <p className="text-gray-300 text-sm mb-4">{playlist.description || 'No description'}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400">
                  <span className="text-white font-medium">{ownerName}</span>
                  <span>•</span>
                  <span>{tracksCount} songs</span>
                  {durationBlock}
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-900/80 border-b border-gray-800 flex flex-wrap items-center gap-4 relative">
            <button
              onClick={handlePlayAll}
              disabled={!playlist.tracks || playlist.tracks.length === 0}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <i className="fas fa-play" /> <span>Play</span>
            </button>

            {ownerMenuBlock}
          </div>

          <div className="px-8 py-6">{tracksBlock}</div>
        </main>
      </div>
    </div>
  );
};

export default PlaylistDetailPage;
