import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

function MusicDNAPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [dnaProfile, setDnaProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    // загружаем статистику и строим Music DNA
    console.log('MusicDNAPage: loadStats start');
    setLoading(true);

    try {
      // запрашиваем данные с сервера
      const response = await userAPI.getSmartStats();

      let data = null;
      if (response && response.data && response.data.data) {
        data = response.data.data;
      }

      setStats(data);

      const profile = buildDnaProfile(data);
      setDnaProfile(profile);

      console.log('MusicDNAPage: loadStats success');
    } catch (error) {
      console.log(error);
      setStats(null);
      setDnaProfile(null);
    } finally {
      setLoading(false);
      console.log('MusicDNAPage: loadStats end');
    }
  }

  useEffect(() => {
    console.log('MusicDNAPage: mount');
    loadStats();
  }, []);

  function buildDnaProfile(data) {
    if (!data) {
      return null;
    }

    const dayStats = data.dayStats;
    if (!Array.isArray(dayStats) || dayStats.length === 0) {
      return null;
    }

    let peakDay = 'Monday';
    let peakCount = 0;

    let totalPlays = 0;

    // проходим по дням и собираем базовые числа
    for (let i = 0; i < dayStats.length; i += 1) {
      const item = dayStats[i];
      if (!item) {
        continue;
      }

      const count = item.count;
      const day = item.day;

      if (typeof count === 'number') {
        totalPlays += count;

        if (count > peakCount) {
          peakCount = count;
          if (day) {
            peakDay = day;
          }
        }
      }
    }

    let uniqueArtists = 0;
    if (data.topArtists && Array.isArray(data.topArtists)) {
      uniqueArtists = data.topArtists.length;
    }

    let personality = 'Casual Listener';
    if (totalPlays > 50 && uniqueArtists > 5) {
      personality = 'The Explorer';
    } else if (totalPlays > 100) {
      personality = 'The Obsessed';
    } else if (uniqueArtists < 3 && totalPlays > 20) {
      personality = 'The Loyalist';
    }

    const profile = {
      personality: personality,
      peakDay: peakDay,
      totalPlays: totalPlays,
      vibe: 'Eclectic Soul',
    };

    return profile;
  }

  function handleStartListening() {
    console.log('MusicDNAPage: go to home');
    navigate('/');
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  let hasData = false;
  if (stats && stats.topArtists && stats.topArtists.length > 0) {
    hasData = true;
  }

  if (!hasData) {
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
                Start listening to generate your unique profile.
              </p>
              <button
                onClick={handleStartListening}
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

  let totalPlaysText = '0';
  if (dnaProfile && typeof dnaProfile.totalPlays === 'number') {
    totalPlaysText = dnaProfile.totalPlays.toString();
  }

  let archetypeText = '';
  if (dnaProfile && dnaProfile.personality) {
    archetypeText = dnaProfile.personality;
  }

  let peakDayText = '';
  if (dnaProfile && dnaProfile.peakDay) {
    peakDayText = dnaProfile.peakDay;
  }

  let vibeText = '';
  if (dnaProfile && dnaProfile.vibe) {
    vibeText = dnaProfile.vibe;
  }

  let maxCount = 1;
  if (stats && stats.dayStats && stats.dayStats.length > 0) {
    for (let i = 0; i < stats.dayStats.length; i += 1) {
      const item = stats.dayStats[i];
      if (item && typeof item.count === 'number') {
        if (item.count > maxCount) {
          maxCount = item.count;
        }
      }
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            <header className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center neon-glow">
                  <span className="text-2xl">🧬</span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Your Music DNA
                </h1>
              </div>
              <p className="text-gray-400 text-sm">Analyzed from {totalPlaysText} plays</p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-6 border border-blue-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">🧘</div>
                <h3 className="text-blue-300 text-sm font-semibold uppercase tracking-wider mb-2">Archetype</h3>
                <div className="text-3xl font-bold text-white mb-2">{archetypeText}</div>
                <p className="text-blue-200/70 text-xs">Based on listening variety.</p>
              </div>

              <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-6 border border-pink-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">⚡</div>
                <h3 className="text-pink-300 text-sm font-semibold uppercase tracking-wider mb-2">Peak Energy</h3>
                <div className="text-3xl font-bold text-white mb-2">{peakDayText}</div>
                <p className="text-pink-200/70 text-xs">Your active day.</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl p-6 border border-emerald-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">🌊</div>
                <h3 className="text-emerald-300 text-sm font-semibold uppercase tracking-wider mb-2">Vibe</h3>
                <div className="text-3xl font-bold text-white mb-2">{vibeText}</div>
                <p className="text-emerald-200/70 text-xs">Sonic signature.</p>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <i className="fas fa-microphone text-blue-400"></i> Top Artists
                </h3>

                <div className="space-y-4">
                  {stats.topArtists.map((artist, idx) => {
                    let indexClass = 'text-gray-500';
                    if (idx === 0) {
                      indexClass = 'text-yellow-400';
                    }

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className={`text-lg font-bold w-6 text-center ${indexClass}`}>{idx + 1}</span>
                          <span className="font-medium text-white">{artist.name}</span>
                        </div>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                          {artist.count} plays
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 flex flex-col">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <i className="fas fa-chart-bar text-purple-400"></i> Rhythm
                </h3>

                <div className="flex-1 flex items-end justify-between gap-2 min-h-[200px]">
                  {stats.dayStats.map((day, idx) => {
                    let height = 5;
                    if (day && typeof day.count === 'number' && maxCount > 0) {
                      height = (day.count / maxCount) * 100;
                      if (height < 5) {
                        height = 5;
                      }
                    }

                    let shortDay = '';
                    if (day && day.day) {
                      shortDay = day.day.substring(0, 3);
                    }

                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 group">
                        <div className="w-full relative flex items-end justify-center h-48 bg-gray-700/30 rounded-t-lg overflow-hidden">
                          <div
                            className="w-full bg-gradient-to-t from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 transition-all duration-500"
                            style={{ height: `${height}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400 mt-2 font-medium">{shortDay}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MusicDNAPage;
