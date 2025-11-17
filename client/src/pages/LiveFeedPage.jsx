import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

const LiveFeedPage = () => {
  const navigate = useNavigate();
  const { setCurrentTrack, setPlaylist, play } = usePlayer();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 10000); // Обновляем каждые 10 сек
    return () => clearInterval(interval);
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await userAPI.getLiveFeed();
      setFeed(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinListening = (track) => {
    setCurrentTrack(track);
    setPlaylist([track]);
    play();
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getMoodEmoji = (mood) => {
    const map = {
      'happy': '😊',
      'sad': '😔',
      'energetic': '⚡',
      'chill': '😌',
      'focused': '🎯',
      'party': '🎉'
    };
    return map[mood] || '';
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
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h1 className="text-3xl sm:text-4xl font-bold">Live Now</h1>
              </div>
              <p className="text-slate-400">See what others are listening to right now</p>
            </div>

            {feed.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎧</div>
                <h2 className="text-2xl font-bold mb-2">No one is listening right now</h2>
                <p className="text-slate-400 mb-8">Be the first to share what you're listening to!</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-semibold transition"
                >
                  Start Listening
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {feed.map((item) => (
                  <div
                    key={item._id}
                    className="bg-slate-800 rounded-2xl p-6 hover:bg-slate-700 transition group"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                        {item.user?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{item.user?.username}</div>
                        <div className="text-sm text-slate-400">{getTimeAgo(item.startedAt)}</div>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>

                    {/* Track Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={item.track?.imageUrl}
                        alt={item.track?.title}
                        className="w-16 h-16 rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate mb-1">{item.track?.title}</h3>
                        <p className="text-sm text-slate-400 truncate">
                          {item.track?.artist?.name}
                        </p>
                      </div>
                    </div>

                    {/* Message & Mood */}
                    {(item.message || item.mood) && (
                      <div className="bg-slate-900 rounded-lg p-3 mb-4">
                        <p className="text-sm text-slate-300">
                          {getMoodEmoji(item.mood)} {item.message || `Feeling ${item.mood}`}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJoinListening(item.track)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-play"></i>
                        Listen Along
                      </button>
                      <button className="bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition">
                        <i className="fas fa-heart"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LiveFeedPage;