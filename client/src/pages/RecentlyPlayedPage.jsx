import React, { useEffect, useState } from 'react';
import { userAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';
import { formatDate } from '../utils/helpers';

const RecentlyPlayedPage = () => {
  const player = usePlayer();

  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [likedTrackIds, setLikedTrackIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('RecentlyPlayedPage: mount');
    fetchRecentlyPlayed();
    fetchLikedTracks();
  }, []);

  const fetchRecentlyPlayed = async () => {
    console.log('RecentlyPlayedPage: fetchRecentlyPlayed start');

    try {
      const response = await userAPI.getRecentlyPlayed();

      let items = [];
      if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        items = response.data.data;
      }

      setRecentlyPlayed(items);
      console.log('RecentlyPlayedPage: recently played loaded', items.length);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      console.log('RecentlyPlayedPage: fetchRecentlyPlayed end');
    }
  };

  const fetchLikedTracks = async () => {
    console.log('RecentlyPlayedPage: fetchLikedTracks start');

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
      console.log('RecentlyPlayedPage: liked ids loaded', ids.length);
    } catch (error) {
      console.log(error);
    }
  };

  const getTracksForPlayer = () => {
    const tracks = [];

    for (let i = 0; i < recentlyPlayed.length; i += 1) {
      const item = recentlyPlayed[i];
      if (item && item.track) {
        tracks.push(item.track);
      }
    }

    return tracks;
  };

  const handlePlayTrack = (track) => {
    console.log('RecentlyPlayedPage: handlePlayTrack', track ? track._id : null);

    const tracks = getTracksForPlayer();
    player.setPlaylist(tracks);
    player.setCurrentTrack(track);
    player.play();
  };

  const handlePlayAll = () => {
    console.log('RecentlyPlayedPage: handlePlayAll');

    if (recentlyPlayed.length === 0) {
      return;
    }

    const tracks = getTracksForPlayer();
    if (tracks.length === 0) {
      return;
    }

    player.setPlaylist(tracks);
    player.setCurrentTrack(tracks[0]);
    player.play();
  };

  const groupByDate = () => {
    const grouped = {};

    for (let i = 0; i < recentlyPlayed.length; i += 1) {
      const item = recentlyPlayed[i];

      if (!item || !item.playedAt) {
        continue;
      }

      const d = new Date(item.playedAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let label = '';
      if (d.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (d.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      } else {
        label = formatDate(d);
      }

      if (!grouped[label]) {
        grouped[label] = [];
      }

      grouped[label].push(item);
    }

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

  const dateKeys = [];
  for (const key in grouped) {
    dateKeys.push(key);
  }

  let contentBlock = null;
  if (recentlyPlayed.length === 0) {
    contentBlock = (
      <div className="text-center py-16 bg-gray-900/70 border border-gray-800 rounded-2xl">
        <i className="fas fa-clock text-6xl text-gray-700 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No listening history yet</h3>
        <p className="text-gray-400">Start listening to see your history here.</p>
      </div>
    );
  } else {
    contentBlock = (
      <div className="space-y-8">
        {dateKeys.map((date) => {
          const items = grouped[date];

          return (
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
                  if (!track) {
                    return null;
                  }

                  const isLiked = likedTrackIds.includes(track._id);

                  return (
                    <TrackItem
                      key={`${track._id}-${item.playedAt}-${index}`}
                      track={track}
                      index={index}
                      onPlay={() => handlePlayTrack(track)}
                      showAlbum={true}
                      showArtist={true}
                      isLiked={isLiked}
                    />
                  );
                })}
              </div>
            </div>
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
          <div className="px-8 py-10 bg-gradient-to-b from-green-900/80 via-gray-900 to-gray-900 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl neon-glow">
                <i className="fas fa-clock text-white text-5xl" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Playlist</p>
                <h1 className="text-5xl font-bold mb-3">Recently Played</h1>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <span className="text-white font-medium">Your history</span>
                  <span>•</span>
                  <span>{recentlyPlayed.length} songs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-900/80 border-b border-gray-800 flex flex-wrap items-center gap-4">
            <button
              onClick={handlePlayAll}
              disabled={recentlyPlayed.length === 0}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <i className="fas fa-play" />
              <span>Play</span>
            </button>
          </div>

          <div className="px-8 py-6">
            {contentBlock}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecentlyPlayedPage;
