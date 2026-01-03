import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackAPI, playlistAPI, userAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import { formatTime } from '../utils/helpers';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

const HomePage = () => {
  const navigate = useNavigate();
  const { setCurrentTrack, setPlaylist, play } = usePlayer();

  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [playlistsRes, tracksRes, recentRes] = await Promise.all([
        playlistAPI.getAll().catch(() => ({ data: { data: [] } })),
        trackAPI.getAll().catch(() => ({ data: { data: [] } })),
        userAPI.getRecentlyPlayed().catch(() => ({ data: { data: [] } })),
      ]);

      setFeaturedPlaylists((playlistsRes.data?.data || []).slice(0, 4));

      const allTracks = tracksRes.data?.data || [];
      const trending = [...allTracks]
        .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
        .slice(0, 5);
      setTrendingTracks(trending);

      const recent = (recentRes.data?.data || []).slice(0, 3);
      setRecentlyPlayed(recent);
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track, list) => {
    const playlist = list && list.length ? list : [track];
    setPlaylist(playlist);
    setCurrentTrack(track);
    play();
  };

  const handleStartListening = () => {
    if (recentlyPlayed.length > 0 && recentlyPlayed[0].track) {
      const track = recentlyPlayed[0].track;
      const list = recentlyPlayed.map((item) => item.track).filter(Boolean);
      handlePlayTrack(track, list);
    } else if (trendingTracks.length > 0) {
      handlePlayTrack(trendingTracks[0], trendingTracks);
    } else {
      navigate('/recently-played');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header с профилем справа */}
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all"
              >
                <i className="fas fa-chevron-left text-gray-400"></i>
              </button>
              <button
                onClick={() => window.history.forward()}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all"
              >
                <i className="fas fa-chevron-right text-gray-400"></i>
              </button>
            </div>

            {/* TopNav component (с аватаром и поиском) */}
            <TopNav />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="px-8 py-8">
            {/* HERO SECTION */}
            <section className="mb-12">
              <div className="relative rounded-2xl overflow-hidden gradient-blue p-12 h-80 flex items-center">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-10 right-20 w-64 h-64 bg-pink-400 rounded-full blur-3xl" />
                  <div className="absolute bottom-10 left-20 w-64 h-64 bg-purple-400 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-5xl font-bold mb-4 text-white">Discover Your Sound</h2>
                  <p className="text-xl text-blue-100 mb-8">
                    Explore millions of tracks in retro-inspired clarity
                  </p>
                  <button
                    onClick={handleStartListening}
                    className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg"
                  >
                    <i className="fas fa-play mr-2" />
                    Start Listening
                  </button>
                </div>
              </div>
            </section>

            {/* FEATURED PLAYLISTS */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Featured Playlists</h3>
                <button
                  onClick={() => navigate('/playlists')}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-all"
                >
                  See all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredPlaylists.length === 0 ? (
                  <div className="col-span-4 text-sm text-gray-400">
                    No playlists yet. Create one to see it here.
                  </div>
                ) : (
                  featuredPlaylists.map((pl) => (
                    <div
                      key={pl._id}
                      className="card-hover bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 cursor-pointer"
                      onClick={() => navigate(`/playlists/${pl._id}`)}
                    >
                      <div className="w-full aspect-square rounded-lg mb-4 overflow-hidden">
                        {pl.coverImage ? (
                          <img
                            src={pl.coverImage}
                            alt={pl.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full gradient-purple flex items-center justify-center">
                            <i className={`fas ${pl.icon || 'fa-music'} text-white text-3xl`} />
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-white mb-1 truncate">{pl.name}</h4>
                      <p className="text-sm text-gray-400 truncate">
                        {pl.description || 'Curated just for you'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* TRENDING NOW */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Trending Now</h3>
                <button
                  onClick={() => navigate('/recently-played')}
                  className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-all"
                >
                  See all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {trendingTracks.map((track) => (
                  <div
                    key={track._id}
                    className="card-hover bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 cursor-pointer"
                    onClick={() => handlePlayTrack(track, trendingTracks)}
                  >
                    <div className="w-full aspect-square rounded-lg mb-3 overflow-hidden">
                      {track.imageUrl ? (
                        <img
                          src={track.imageUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full gradient-blue" />
                      )}
                    </div>
                    <h4 className="font-medium text-white text-sm mb-1 truncate">
                      {track.title}
                    </h4>
                    <p className="text-xs text-gray-400 truncate">
                      {track.artist?.name || 'Unknown Artist'}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* BROWSE BY MOOD */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Browse by Mood</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-hover relative rounded-xl overflow-hidden h-48 cursor-pointer group">
                  <div className="absolute inset-0 gradient-blue opacity-80 group-hover:opacity-90 transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-moon text-5xl text-white mb-3" />
                      <h4 className="text-xl font-bold text-white">Chill Vibes</h4>
                    </div>
                  </div>
                </div>

                <div className="card-hover relative rounded-xl overflow-hidden h-48 cursor-pointer group">
                  <div className="absolute inset-0 gradient-purple opacity-80 group-hover:opacity-90 transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-bolt text-5xl text-white mb-3" />
                      <h4 className="text-xl font-bold text-white">High Energy</h4>
                    </div>
                  </div>
                </div>

                <div className="card-hover relative rounded-xl overflow-hidden h-48 cursor-pointer group">
                  <div className="absolute inset-0 gradient-pink opacity-80 group-hover:opacity-90 transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-heart text-5xl text-white mb-3" />
                      <h4 className="text-xl font-bold text-white">Feel Good</h4>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* RECENTLY PLAYED */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Recently Played</h3>
              </div>
              <div className="space-y-3">
                {recentlyPlayed.length === 0 ? (
                  <div className="text-sm text-gray-400">
                    No listening history yet. Start listening to see tracks here.
                  </div>
                ) : (
                  recentlyPlayed.map((item, idx) => {
                    const track = item.track;
                    if (!track) return null;
                    const list = recentlyPlayed.map((i) => i.track).filter(Boolean);

                    return (
                      <div
                        key={`${track._id}-${item.playedAt}-${idx}`}
                        className="flex items-center space-x-4 p-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 cursor-pointer transition-all group"
                        onClick={() => handlePlayTrack(track, list)}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          {track.imageUrl ? (
                            <img
                              src={track.imageUrl}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full gradient-purple" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">
                            {track.title}
                          </h4>
                          <p className="text-sm text-gray-400 truncate">
                            {track.artist?.name || 'Unknown Artist'}
                          </p>
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatTime(track.duration)}
                        </div>
                        <button className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <i className="fas fa-play text-white text-sm ml-0.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      <style >{`
        .gradient-blue {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .gradient-purple {
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
        }
        .gradient-pink {
          background: linear-gradient(135deg, #ec4899 0%, #f97316 100%);
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
        }
      `}</style>
    </div>
  );
};

export default HomePage;