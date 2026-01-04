import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { artistAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';

const ArtistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    play,
    setCurrentTrack,
    setPlaylist,
    isArtistFollowed,
    toggleFollowLocally
  } = usePlayer();

  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      try {
        const res = await artistAPI.getById(id);
        setArtist(res.data.data);
      } catch (err) {
        console.error("Failed to load artist", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [id]);

  const handlePlay = () => {
    if (artist && artist.tracks && artist.tracks.length > 0) {
      setPlaylist(artist.tracks);
      setCurrentTrack(artist.tracks[0]);
      play();
    }
  };

  const handleFollow = async () => {
    if (!artist) return;
    const isFollowing = isArtistFollowed(artist._id);
    toggleFollowLocally(artist._id);
    try {
      if (isFollowing) {
        await artistAPI.unfollow(artist._id);
      } else {
        await artistAPI.follow(artist._id);
      }
    } catch (error) {
      console.error('Follow error:', error);
      toggleFollowLocally(artist._id);
    }
  };

  const handleSimilarArtistClick = (similarId) => {
    navigate(`/artist/${similarId}`);
    document.querySelector('main').scrollTo(0, 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900"><i className="fas fa-spinner fa-spin text-4xl text-blue-400" /></div>;
  if (!artist) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Artist not found</div>;

  const isFollowing = isArtistFollowed(artist._id);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto pb-32 scroll-smooth">

          {/* --- HERO SECTION --- */}
          <div className="relative h-[40vh] min-h-[340px] max-h-[500px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${artist.coverImage || artist.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 p-8 w-full z-10">
              <div className="flex items-center gap-2 mb-2 text-white">
                {artist.verified && <i className="fas fa-certificate text-blue-400 text-xl" title="Verified Artist"></i>}
                <span className="text-sm font-medium tracking-wider uppercase text-gray-200">Verified Artist</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black text-white mb-6 drop-shadow-lg tracking-tight">
                {artist.name}
              </h1>

              <div className="flex items-center gap-6 mb-2">
                <p className="text-gray-300 text-sm font-medium">
                  <span className="text-white font-bold">{formatNumber(artist.monthlyListeners || 0)}</span> monthly listeners
                </p>
              </div>

              {/* Buttons: ВЕРНУЛ ТВОИ ЦВЕТА */}
              <div className="flex items-center gap-4 mt-6">
                {/* КНОПКА PLAY: Теперь сине-фиолетовый градиент (как в Liked Songs) */}
                <button
                  onClick={handlePlay}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg hover:shadow-blue-500/50"
                >
                  <i className="fas fa-play text-xl ml-1"></i>
                </button>

                {/* КНОПКА FOLLOW */}
                <button
                  onClick={handleFollow}
                  className={`px-8 py-2 rounded-full text-sm font-bold border transition-all uppercase tracking-wide ${isFollowing
                    ? 'border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white'
                    : 'bg-white text-black border-transparent hover:scale-105'
                    }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>

                <button className="text-gray-400 hover:text-white transition-colors">
                  <i className="fas fa-ellipsis-h text-2xl"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="px-8 py-8 max-w-7xl mx-auto">

            {/* --- POPULAR TRACKS --- */}
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-white mb-6">Popular</h2>
                <div className="flex flex-col">
                  {artist.tracks && artist.tracks.slice(0, 5).map((track, index) => (
                    <TrackItem
                      key={track._id}
                      track={track}
                      index={index} 
                      onPlay={() => {
                        setPlaylist(artist.tracks);
                        setCurrentTrack(track);
                        play();
                      }}
                      showArtist={false}
                    />
                  ))}
                </div>
                </div>

              {/* --- ARTIST BIO --- */}
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold text-white mb-6">About</h2>
                <div className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800 transition-colors cursor-pointer relative overflow-hidden group border border-transparent hover:border-blue-500/30">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-700"
                    style={{ backgroundImage: `url(${artist.imageUrl})` }}
                  />
                  <div className="relative z-10">
                    <p className="text-gray-300 leading-relaxed line-clamp-6">
                      {artist.bio || "No biography available for this artist."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- ALBUMS --- */}
            {artist.albums && artist.albums.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">Discography</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {artist.albums.map((album, idx) => (
                    <Link to={`/album/${album._id}`} key={album._id} className="bg-gray-900/40 p-4 rounded-xl hover:bg-gray-800 transition-all group cursor-pointer border border-transparent hover:border-purple-500/30 block">
                      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">
                        <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                        {/* Play Button on Hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform">
                            <i className="fas fa-play ml-1"></i>
                          </div>
                        </div>
                      </div>
                      <h3 className="font-bold text-white truncate">{album.title}</h3>
                      <p className="text-sm text-gray-400">{album.year} • Album</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* --- SIMILAR ARTISTS --- */}
            {artist.similarArtists && artist.similarArtists.length > 0 && (
              <div className="mt-16 mb-10">
                <h2 className="text-2xl font-bold text-white mb-6">Fans also like</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {artist.similarArtists.map((simArtist) => (
                    <div
                      key={simArtist._id}
                      onClick={() => handleSimilarArtistClick(simArtist._id)}
                      className="bg-gray-900/40 p-4 rounded-xl hover:bg-gray-800 transition-all group cursor-pointer flex flex-col items-center text-center border border-transparent hover:border-blue-500/30"
                    >
                      <div className="w-40 h-40 mb-4 rounded-full overflow-hidden shadow-lg relative border-2 border-transparent group-hover:border-blue-500 transition-all">
                        <img
                          src={simArtist.imageUrl}
                          alt={simArtist.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="font-bold text-white hover:underline truncate w-full">{simArtist.name}</h3>
                      <p className="text-sm text-gray-400">Artist</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default ArtistPage;