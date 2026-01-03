import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

const MusicDNAPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dna, setDna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMusicDNA();
  }, []);

  const fetchMusicDNA = async () => {
    try {
      const response = await userAPI.getMusicDNA();
      setDna(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPersonalityEmoji = (personality) => {
    const map = {
      'Casual Listener': '🎧',
      'Music Enthusiast': '🎵',
      'Music Addict': '🔥',
      'Collector': '💎',
    };
    return map[personality] || '🎧';
  };

  const getTimeEmoji = (time) => {
    const map = {
      'Morning Person': '☀️',
      'Afternoon Listener': '🌤️',
      'Night Owl': '🌙',
      'Midnight Listener': '🌃',
    };
    return map[time] || '🎵';
  };

  const getMoodEmoji = (mood) => {
    const map = {
      happy: '😊',
      sad: '😔',
      energetic: '⚡',
      chill: '😌',
      focused: '🎯',
      party: '🎉',
      Chill: '😌',
    };
    return map[mood] || '🎵';
  };

  const shareMusicDNA = () => {
    if (!dna) return;
    const text = `🧬 My Music DNA\n\n${getPersonalityEmoji(
      dna.personality,
    )} ${dna.personality}\n${getTimeEmoji(
      dna.listeningTime,
    )} ${dna.listeningTime}\n${getMoodEmoji(
      dna.topMood,
    )} Top Mood: ${dna.topMood} ${dna.topMoodPercentage}%\n\nCheck out RetroWave!`;

    navigator.clipboard.writeText(text).catch(console.error);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  if (!dna || dna.totalTracks === 0) {
    return (
      <div className="flex h-screen bg-gray-900 text-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 flex items-center justify-center pb-32">
            <div className="text-center px-4">
              <div className="text-6xl mb-6">🧬</div>
              <h2 className="text-3xl font-bold mb-3">Build Your Music DNA</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
                Start listening to generate your unique Music DNA profile.
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
          <div className="max-w-3xl mx-auto">
            <header className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center neon-glow">
                  <span className="text-2xl">🧬</span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Your Music DNA
                </h1>
              </div>
              <p className="text-gray-400 text-sm">
                A snapshot of your musical identity
              </p>
            </header>

            <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 rounded-3xl p-8 mb-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-30" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full blur-3xl opacity-30" />

              <div className="relative z-10 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">
                    @{user?.username}&apos;s Music DNA
                  </h2>
                  <p className="text-xs text-gray-200 mt-1">
                    Musical Identity Card
                  </p>
                </div>

                {/* Personality */}
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4 border border-white/10">
                  <div className="text-4xl">
                    {getPersonalityEmoji(dna.personality)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Personality</p>
                    <h3 className="text-xl font-semibold">{dna.personality}</h3>
                  </div>
                </div>

                {/* Time */}
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4 border border-white/10">
                  <div className="text-4xl">
                    {getTimeEmoji(dna.listeningTime)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 mb-1">
                      Listening Time
                    </p>
                    <h3 className="text-xl font-semibold">
                      {dna.listeningTime}
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">
                      Peak at {dna.peakHour}:00
                    </p>
                  </div>
                </div>

                {/* Mood */}
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4 border border-white/10">
                  <div className="text-4xl">
                    {getMoodEmoji(dna.topMood)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 mb-1">Top Mood</p>
                    <h3 className="text-xl font-semibold mb-2">
                      {dna.topMood}
                    </h3>
                    <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                        style={{ width: `${dna.topMoodPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-300 mt-1">
                      {dna.topMoodPercentage}% of your music
                    </p>
                  </div>
                </div>

                {/* Early Adopter */}
                {dna.earlyAdopter && (
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-5 border border-yellow-400/40 flex items-center gap-4">
                    <div className="text-4xl">🌟</div>
                    <div>
                      <p className="text-sm text-yellow-200 mb-1">
                        Achievement
                      </p>
                      <h3 className="text-xl font-semibold text-yellow-100">
                        Early Adopter
                      </h3>
                      <p className="text-xs text-yellow-100/80 mt-1">
                        You discover artists before they become mainstream.
                      </p>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                    <p className="text-2xl font-bold text-blue-200">
                      {dna.totalTracks}
                    </p>
                    <p className="text-xs text-gray-200 mt-1">Tracks</p>
                  </div>
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                    <p className="text-2xl font-bold text-purple-200">
                      {dna.likedTracks}
                    </p>
                    <p className="text-xs text-gray-200 mt-1">Liked</p>
                  </div>
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                    <p className="text-2xl font-bold text-pink-200">
                      {dna.followedArtists}
                    </p>
                    <p className="text-xs text-gray-200 mt-1">Artists</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Top Genres */}
            {dna.topGenres && dna.topGenres.length > 0 && (
              <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🎸</span> Top Genres
                </h2>
                <div className="space-y-3">
                  {dna.topGenres.map((g, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{g.genre}</span>
                        <span className="text-gray-400">{g.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${g.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Share button */}
            <button
              onClick={shareMusicDNA}
              className="w-full px-6 py-4 rounded-2xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <i className="fas fa-check" />
                  Copied to clipboard
                </>
              ) : (
                <>
                  <i className="fas fa-share-alt" />
                  Share your Music DNA
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MusicDNAPage;