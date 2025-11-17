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
      'Collector': '💎'
    };
    return map[personality] || '🎧';
  };

  const getTimeEmoji = (time) => {
    const map = {
      'Morning Person': '☀️',
      'Afternoon Listener': '🌤️',
      'Night Owl': '🌙',
      'Midnight Listener': '🌃'
    };
    return map[time] || '🎵';
  };

  const getMoodEmoji = (mood) => {
    const map = {
      'happy': '😊',
      'sad': '😔',
      'energetic': '⚡',
      'chill': '😌',
      'focused': '🎯',
      'party': '🎉',
      'Chill': '😌'
    };
    return map[mood] || '🎵';
  };

  const shareMusicDNA = () => {
    const text = `🧬 My Music DNA\n\n${getPersonalityEmoji(dna.personality)} ${dna.personality}\n${getTimeEmoji(dna.listeningTime)} ${dna.listeningTime}\n${getMoodEmoji(dna.topMood)} Top Mood: ${dna.topMood} ${dna.topMoodPercentage}%\n\nCheck out SoundWave!`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  if (!dna || dna.totalTracks === 0) {
    return (
      <div className="flex h-screen bg-slate-950 text-slate-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 flex items-center justify-center pb-32">
            <div className="text-center px-4">
              <div className="text-6xl mb-6">🧬</div>
              <h2 className="text-3xl font-bold mb-4">Build Your Music DNA</h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Start listening to music to generate your unique Music DNA profile
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
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Your Music DNA</h1>
              <p className="text-slate-400">Your unique musical identity</p>
            </div>

            {/* Music DNA Card */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 rounded-3xl p-8 mb-8 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
                
                <div className="relative">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="text-7xl mb-4">🧬</div>
                    <h2 className="text-2xl font-bold mb-1">@{user?.username}'s Music DNA</h2>
                    <p className="text-slate-300 text-sm">Musical Identity Card</p>
                  </div>

                  {/* DNA Info */}
                  <div className="space-y-6 mb-8">
                    {/* Personality */}
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{getPersonalityEmoji(dna.personality)}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">{dna.personality}</h3>
                          <p className="text-sm text-slate-300">Your listening style</p>
                        </div>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{getTimeEmoji(dna.listeningTime)}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">{dna.listeningTime}</h3>
                          <p className="text-sm text-slate-300">Peak activity at {dna.peakHour}:00</p>
                        </div>
                      </div>
                    </div>

                    {/* Mood */}
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{getMoodEmoji(dna.topMood)}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">Top Mood: {dna.topMood}</h3>
                          <div className="mt-2">
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                style={{ width: `${dna.topMoodPercentage}%` }}
                              />
                            </div>
                            <p className="text-sm text-slate-300 mt-1">{dna.topMoodPercentage}% of your music</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Early Adopter Badge */}
                    {dna.earlyAdopter && (
                      <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30">
                        <div className="flex items-center gap-4">
                          <div className="text-5xl">🌟</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">Early Adopter</h3>
                            <p className="text-sm text-slate-300">You discover artists before they're mainstream</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top Genres */}
                    {dna.topGenres && dna.topGenres.length > 0 && (
                      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <span className="text-2xl">🎸</span>
                          Top Genres
                        </h4>
                        <div className="space-y-3">
                          {dna.topGenres.map((genre, index) => (
                            <div key={index}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{genre.genre}</span>
                                <span className="text-slate-400">{genre.percentage}%</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                  style={{ width: `${genre.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">{dna.totalTracks}</div>
                        <div className="text-xs text-slate-400 mt-1">Tracks</div>
                      </div>
                      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">{dna.likedTracks}</div>
                        <div className="text-xs text-slate-400 mt-1">Liked</div>
                      </div>
                      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-pink-400">{dna.followedArtists}</div>
                        <div className="text-xs text-slate-400 mt-1">Artists</div>
                      </div>
                    </div>
                  </div>

                  {/* Share Button */}
                  <button
                    onClick={shareMusicDNA}
                    className="w-full bg-white text-slate-900 hover:bg-slate-100 py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <i className="fas fa-check"></i>
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <i className="fas fa-share-alt"></i>
                        Share Your Music DNA
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MusicDNAPage;