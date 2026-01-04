import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';
import { formatDate } from '../utils/helpers';

const RecentlyPlayedPage = () => {
  const { setCurrentTrack, setPlaylist, play } = usePlayer();
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [likedTrackIds, setLikedTrackIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentlyPlayed();
    fetchLikedTracks();
  }, []);

  const fetchRecentlyPlayed = async () => {
    try {
      const response = await userAPI.getRecentlyPlayed();
      setRecentlyPlayed(response.data.data || []);
    } catch (error) {
      console.error('Error fetching recently played:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedTracks = async () => {
    try {
      const response = await userAPI.getLikedTracks();
      setLikedTrackIds(response.data.data.map((t) => t._id));
    } catch (error) {
      console.error('Error fetching liked tracks:', error);
    }
  };

  const handlePlayTrack = (track) => {
    const tracks = recentlyPlayed.map((item) => item.track).filter(Boolean);
    setPlaylist(tracks);
    setCurrentTrack(track);
    play();
  };

  const handlePlayAll = () => {
    if (!recentlyPlayed.length) return;
    const tracks = recentlyPlayed.map((item) => item.track).filter(Boolean);
    if (!tracks.length) return;
    setPlaylist(tracks);
    setCurrentTrack(tracks[0]);
    play();
  };

  const groupByDate = () => {
    const grouped = {};
    recentlyPlayed.forEach((item) => {
      const d = new Date(item.playedAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let label;
      if (d.toDateString() === today.toDateString()) label = 'Today';
      else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
      else label = formatDate(d);

      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  const grouped = groupByDate();

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          {/* Header */}
          <div className="px-8 py-10 bg-gradient-to-b from-green-900/80 via-gray-900 to-gray-900 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl neon-glow">
                <i className="fas fa-clock text-white text-5xl" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                  Playlist
                </p>
                <h1 className="text-5xl font-bold mb-3">
                  Recently Played
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <span className="text-white font-medium">Your history</span>
                  <span>•</span>
                  <span>{recentlyPlayed.length} songs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="px-8 py-6 bg-gray-900/80 border-b border-gray-800 flex flex-wrap items-center gap-4">
            <button
              onClick={handlePlayAll}
              disabled={!recentlyPlayed.length}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <i className="fas fa-play" />
              <span>Play</span>
            </button>
          </div>

          {/* Tracks by date */}
          <div className="px-8 py-6 space-y-8">
            {recentlyPlayed.length === 0 ? (
              <div className="text-center py-16 bg-gray-900/70 border border-gray-800 rounded-2xl">
                <i className="fas fa-clock text-6xl text-gray-700 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No listening history yet</h3>
                <p className="text-gray-400">
                  Start listening to see your history here.
                </p>
              </div>
            ) : (
                Object.entries(grouped).map(([date, items]) => (
                  <div key={date}>
                  <h2 className="text-lg font-semibold mb-3 px-1">{date}</h2>

                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-800 mb-2">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Title</div>
                    <div className="col-span-3">Album</div>
                    <div className="col-span-2">Genre</div>
                    <div className="col-span-1 text-right">
                      <i className="far fa-clock" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    {items.map((item, index) => {
                      const track = item.track;
                      if (!track) return null;
                      return (
                        <TrackItem
                          key={`${track._id}-${item.playedAt}-${index}`}
                          track={track}
                          index={index}
                          onPlay={() => handlePlayTrack(track)}
                          showAlbum={true}
                          showArtist={true}
                          isLiked={likedTrackIds.includes(track._id)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecentlyPlayedPage;