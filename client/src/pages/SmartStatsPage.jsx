import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

const SmartStatsPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await userAPI.getSmartStats();
      setStats(response.data.data || null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightColor = (type) => {
    const colors = {
      mood: 'from-purple-500 to-pink-500',
      compatibility: 'from-blue-500 to-cyan-500',
      global: 'from-green-500 to-emerald-500',
      energy: 'from-orange-500 to-red-500',
      artist: 'from-indigo-500 to-purple-500',
    };
    return colors[type] || 'from-gray-500 to-gray-700';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  if (!stats || !stats.insights || stats.insights.length === 0) {
    return (
      <div className="flex h-screen bg-gray-900 text-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 flex items-center justify-center pb-32">
            <div className="text-center px-4">
              <div className="text-6xl mb-6">📊</div>
              <h2 className="text-3xl font-bold mb-3">Not Enough Data Yet</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
                Keep listening to unlock personalized insights about your music habits.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
              >
                Start Listening
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <header>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Smart Stats
              </h1>
              <p className="text-gray-400 text-sm">
                Insights that actually say something about your listening.
              </p>
            </header>

            {/* Insights Grid */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>✨</span> Key Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${getInsightColor(
                      insight.type,
                    )} p-[2px] rounded-2xl`}
                  >
                    <div className="bg-gray-900 rounded-2xl p-6 h-full backdrop-blur-sm">
                      <div className="text-3xl mb-3">{insight.icon}</div>
                      <p className="text-sm sm:text-base leading-relaxed">
                        {insight.text}
                      </p>

                      {insight.type === 'mood' && insight.value > 0 && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full text-xs">
                          <i className="fas fa-arrow-up text-pink-400" />
                          <span className="font-semibold">
                            +{insight.value}% more chill
                          </span>
                        </div>
                      )}

                      {insight.type === 'compatibility' && (
                        <div className="mt-4">
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                              style={{ width: `${insight.value}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {insight.type === 'global' && (
                        <p className="mt-3 text-xs text-gray-400">
                          Based on your favorite genres and playtime.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Artists */}
            {stats.topArtists && stats.topArtists.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>🎤</span> Your Top Artists
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.topArtists.map((artist, index) => (
                    <div
                      key={artist.id}
                      className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:border-gray-600 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">
                          {artist.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {artist.count} plays
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Compatibility */}
            {stats.compatibility && stats.compatibility.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>🤝</span> Music Compatibility
                </h2>
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 space-y-4">
                  {stats.compatibility.map((match, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-gray-900/50 rounded-xl p-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                        {match.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold mb-1">
                          @{match.username}
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${match.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-blue-300">
                        {match.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Listening by Day */}
            {stats.dayStats && stats.dayStats.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>📅</span> Weekly Listening Pattern
                </h2>
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                  <div className="flex items-end justify-between gap-2 h-56">
                    {stats.dayStats.map((day, index) => {
                      const maxCount = Math.max(
                        ...stats.dayStats.map((d) => d.count),
                      );
                      const height =
                        maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                      return (
                        <div
                          key={index}
                          className="flex-1 flex flex-col items-center gap-1 group"
                        >
                          <div className="w-full flex items-end justify-center flex-1 relative">
                            <div
                              className="w-full bg-gradient-to-t from-blue-500 to-purple-400 rounded-t-lg hover:from-blue-400 hover:to-purple-300 transition-all cursor-pointer"
                              style={{ height: `${height}%` }}
                            >
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                {day.count}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 font-medium">
                            {day.day}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SmartStatsPage;