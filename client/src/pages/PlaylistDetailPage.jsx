import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistAPI, userAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';
import { formatTime } from '../utils/helpers';

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCurrentTrack, setPlaylist: setPlayerPlaylist, play } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [likedTracks, setLikedTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylist();
    fetchLikedTracks();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      const response = await playlistAPI.getById(id);
      setPlaylist(response.data.data);
    } catch (error) {
      console.error('Error fetching playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedTracks = async () => {
    try {
      const response = await userAPI.getLikedTracks();
      setLikedTracks(response.data.data.map(t => t._id));
    } catch (error) {
      console.error('Error fetching liked tracks:', error);
    }
  };

  const handlePlayTrack = (track) => {
    const tracks = playlist.tracks.map(item => item.track);
    setPlayerPlaylist(tracks);
    setCurrentTrack(track);
    play();
  };

  const handlePlayAll = () => {
    if (playlist?.tracks && playlist.tracks.length > 0) {
      const tracks = playlist.tracks.map(item => item.track);
      setPlayerPlaylist(tracks);
      setCurrentTrack(tracks[0]);
      play();
    }
  };

  const getTotalDuration = () => {
    if (!playlist?.tracks) return 0;
    return playlist.tracks.reduce((total, item) => {
      return total + (item.track?.duration || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-6xl text-slate-600 mb-4"></i>
          <p className="text-slate-400">Playlist not found</p>
        </div>
      </div>
    );
  }

  const totalDuration = getTotalDuration();
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          {/* Playlist Header */}
          <div className={`bg-gradient-to-b from-${playlist.color}-900 to-slate-950 px-4 md:px-8 py-8 md:py-12`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
              <div className={`w-48 h-48 bg-gradient-to-br from-${playlist.color}-500 to-${playlist.color}-700 rounded-lg shadow-2xl flex items-center justify-center flex-shrink-0`}>
                <i className={`fas ${playlist.icon} text-white text-6xl`}></i>
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mb-2">
                  Playlist
                </p>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">{playlist.name}</h1>
                <p className="text-slate-300 mb-4">{playlist.description}</p>
                <div className="flex items-center space-x-2 text-xs md:text-sm text-slate-400">
                  <span className="font-medium text-slate-100">{playlist.user?.username}</span>
                  <span>•</span>
                  <span>{playlist.tracks?.length || 0} songs</span>
                  {totalDuration > 0 && (
                    <>
                      <span>•</span>
                      <span>
                        {hours > 0 && `${hours} hr `}
                        {minutes} min
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-950 bg-opacity-60 backdrop-blur-sm px-4 md:px-8 py-6 flex flex-wrap items-center gap-4">
            <button
              onClick={handlePlayAll}
              disabled={!playlist.tracks || playlist.tracks.length === 0}
              className="bg-blue-600 hover:bg-blue-700 transition-colors px-8 py-3 rounded-full font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-play"></i>
              <span>Play</span>
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 transition-colors p-3 rounded-full">
              <i className="fas fa-random text-lg"></i>
            </button>
          </div>

          {/* Tracks List */}
          <div className="px-4 md:px-8 py-6">
            {!playlist.tracks || playlist.tracks.length === 0 ? (
              <div className="text-center py-16">
                <i className="fas fa-music text-6xl text-slate-700 mb-4"></i>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  No tracks in this playlist
                </h3>
                <p className="text-slate-400">Add some tracks to get started</p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-2">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">Title</div>
                  <div className="col-span-3">Album</div>
                  <div className="col-span-2">Genre</div>
                  <div className="col-span-1 text-right">
                    <i className="far fa-clock"></i>
                  </div>
                </div>

                {/* Track Items */}
                <div className="space-y-1">
                  {playlist.tracks.map((item, index) => {
                    const track = item.track;
                    if (!track) return null;

                    return (
                      <TrackItem
                        key={`${track._id}-${index}`}
                        track={track}
                        index={index}
                        onPlay={() => handlePlayTrack(track)}
                        showAlbum={true}
                        showArtist={true}
                        isLiked={likedTracks.includes(track._id)}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlaylistDetailPage;