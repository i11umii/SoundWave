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
      setStats(response.data.data);
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
      energy: 'from-orange-500 to-red-500'
    };
    return colors[type] || 'from-slate-500 to-slate-600';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  if (!stats || !stats.insights || stats.insights.length === 0) {
    return (
      <div className="flex h-screen bg-slate-950 text-slate-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 flex items-center justify-center pb-32">
            <div className="text-center px-4">
              <div className="text-6xl mb-6">📊</div>
              <h2 className="text-3xl font-bold mb-4">Not Enough Data Yet</h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Keep listening to unlock personalized insights about your music habits
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full font-semibold transition"
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
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Smart Stats</h1>
              <p className="text-slate-400">Insights that actually matter</p>
            </div>

            {/* Key Insights */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                <span className="text-3xl mr-2">✨</span>
                Your Musical Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${getInsightColor(insight.type)} p-[2px] rounded-2xl`}
                  >
                    <div className="bg-slate-900 rounded-2xl p-6 h-full">
                      <div className="text-4xl mb-4">{insight.icon}</div>
                      <p className="text-lg leading-relaxed">{insight.text}</p>
                      {insight.type === 'mood' && insight.value > 0 && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full">
                          <i className="fas fa-arrow-up text-red-400"></i>
                          <span className="text-sm font-semibold">+{insight.value}%</span>
                        </div>
                      )}
                      {insight.type === 'compatibility' && (
                        <div className="mt-4">
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                              style={{ width: `${insight.value}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Artists */}
            {stats.topArtists && stats.topArtists.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-3xl mr-2">🎤</span>
                  Your Top Artists
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.topArtists.map((artist, index) => (
                    <div
                      key={artist.id}
                      className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{artist.name}</h3>
                          <p className="text-sm text-slate-400">{artist.count} plays</p>
                        </div>
                        <i className="fas fa-chevron-right text-slate-600 group-hover:text-slate-400 transition"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compatibility */}
            {stats.compatibility && stats.compatibility.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-3xl mr-2">🤝</span>
                  Music Compatibility
                </h2>
                <div className="bg-slate-800 rounded-2xl p-6">
                  <p className="text-slate-400 mb-6">
                    Find people who share your musical taste
                  </p>
                  <div className="space-y-4">
                    {stats.compatibility.map((match, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 bg-slate-900 rounded-xl p-4"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                          {match.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">@{match.username}</div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${match.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-400">
                          {match.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Listening by Day */}
            {stats.dayStats && stats.dayStats.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-3xl mr-2">📅</span>
                  Weekly Listening Pattern
                </h2>
                <div className="bg-slate-800 rounded-2xl p-6">
                  <div className="flex items-end justify-between gap-2 h-64">
                    {stats.dayStats.map((day, index) => {
                      const maxCount = Math.max(...stats.dayStats.map(d => d.count));
                      const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex items-end justify-center flex-1">
                            <div
                              className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg hover:from-blue-500 hover:to-blue-300 transition-all cursor-pointer relative group"
                              style={{ height: `${height}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap">
                                {day.count} tracks
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-400 font-medium">{day.day}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-2">Want More Insights?</h3>
              <p className="text-slate-300 mb-6">
                Keep listening to unlock deeper analysis of your music taste
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 rounded-full font-semibold transition"
              >
                Discover More Music
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SmartStatsPage;