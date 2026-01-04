import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { albumAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import { formatTime } from '../utils/helpers';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';

const AlbumPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);

    const { play, setCurrentTrack, setPlaylist } = usePlayer();

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await albumAPI.getById(id);
                setAlbum(res.data.data);
            } catch (err) {
                console.error("Failed to load album", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlbum();
    }, [id]);

    const handlePlayAlbum = () => {
        if (album && album.tracks && album.tracks.length > 0) {
            setPlaylist(album.tracks);
            setCurrentTrack(album.tracks[0]);
            play();
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900"><i className="fas fa-spinner fa-spin text-4xl text-blue-400" /></div>;
    if (!album) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Album not found</div>;

    // Считаем общую длительность
    const totalDuration = album.tracks.reduce((acc, curr) => acc + curr.duration, 0);
    const totalMinutes = Math.floor(totalDuration / 60);

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNav />
                <main className="flex-1 overflow-y-auto pb-32">

                    {/* --- HERO SECTION --- */}
                    <div className="px-8 py-10 bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-800 flex items-end gap-8">
                        {/* Cover Art */}
                        <div className="w-52 h-52 shadow-2xl rounded-lg overflow-hidden shrink-0 group relative">
                            <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <p className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-2">Album</p>
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-none">
                                {album.title}
                            </h1>

                            <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                                {album.artist && (
                                    <>
                                        <img src={album.artist.imageUrl} alt={album.artist.name} className="w-6 h-6 rounded-full object-cover" />
                                        <Link to={`/artist/${album.artist._id}`} className="text-white hover:underline">
                                            {album.artist.name}
                                        </Link>
                                        <span className="text-gray-500">•</span>
                                    </>
                                )}
                                <span>{album.year}</span>
                                <span className="text-gray-500">•</span>
                                <span>{album.tracks.length} songs, {totalMinutes} min</span>
                            </div>
                        </div>
                    </div>

                    {/* --- CONTROLS --- */}
                    <div className="px-8 py-6 flex items-center gap-6">
                        <button
                            onClick={handlePlayAlbum}
                            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg hover:shadow-blue-500/50"
                        >
                            <i className="fas fa-play text-xl ml-1"></i>
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <i className={`far fa-heart text-3xl`}></i>
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <i className="fas fa-ellipsis-h text-2xl"></i>
                        </button>
                    </div>

                    {/* --- TRACK LIST --- */}
                    <div className="px-8 pb-10">
                        <div className="flex flex-col">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider mb-2">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-10">Title</div>
                                <div className="col-span-1 text-right"><i className="far fa-clock"></i></div>
                            </div>

                            {album.tracks.map((track, index) => (
                                <TrackItem
                                    key={track._id}
                                    track={track}
                                    index={index}
                                    onPlay={() => {
                                        setPlaylist(album.tracks);
                                        setCurrentTrack(track);
                                        play();
                                    }}
                                    showAlbum={false} // Мы и так в альбоме
                                    showArtist={false} // Артист и так известен
                                />
                            ))}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default AlbumPage;