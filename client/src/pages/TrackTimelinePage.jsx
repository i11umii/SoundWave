import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { trackAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';

const TrackTimelinePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setCurrentTrack, play } = usePlayer();

    const [track, setTrack] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');

    const [markers] = useState([
        {
            time: '0:42',
            left: '15%',
            user: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=24&h=24&fit=crop&crop=face',
            color: 'blue',
            text: 'This drop is absolutely insane! 🔥 The synth work here is phenomenal'
        },
        {
            time: '1:58',
            left: '45%',
            user: 'Alex Rivera',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=24&h=24&fit=crop&crop=face',
            color: 'purple',
            text: 'Perfect transition into the breakdown. Love how the bass evolves here'
        },
        {
            time: '2:34',
            left: '65%',
            user: 'Maya Patel',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=24&h=24&fit=crop&crop=face',
            color: 'pink',
            text: 'The vocal chops here give me chills every time. Masterpiece! ✨'
        },
        {
            time: '3:12',
            left: '80%',
            user: 'Jordan Kim',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=24&h=24&fit=crop&crop=face',
            color: 'blue',
            text: 'This is why I love electronic music. Pure emotion through sound waves 🌊'
        }
    ]);

    useEffect(() => {
        fetchTrack();
    }, [id]);

    const fetchTrack = async () => {
        try {
            const res = await trackAPI.getById(id);
            setTrack(res.data.data);
        } catch (err) {
            console.error('Error fetching track:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePlay = () => {
        if (!track) return;
        setCurrentTrack(track);
        play();
    };

    const getColorClasses = (color) => {
        const colors = {
            blue: {
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
                text: 'text-blue-400',
                dot: 'bg-blue-500'
            },
            purple: {
                bg: 'bg-purple-500/10',
                border: 'border-purple-500/20',
                text: 'text-purple-400',
                dot: 'bg-purple-500'
            },
            pink: {
                bg: 'bg-pink-500/10',
                border: 'border-pink-500/20',
                text: 'text-pink-400',
                dot: 'bg-pink-500'
            }
        };
        return colors[color] || colors.blue;
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <i className="fas fa-spinner fa-spin text-4xl text-blue-500" />
            </div>
        );
    }

    if (!track) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 text-gray-400">
                <div className="text-center">
                    <i className="fas fa-exclamation-circle text-6xl mb-4" />
                    <p className="mb-4">Track not found</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <TopNav />

                <main className="max-w-7xl mx-auto px-6 py-8 flex-1 overflow-y-auto pb-32">
                    {/* Track Player Section */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            {/* Album Cover */}
                            <div className="flex justify-center lg:justify-start">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                                    <img
                                        src={track.imageUrl}
                                        alt={track.title}
                                        className="relative w-80 h-80 rounded-2xl shadow-2xl object-cover border border-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Track Info & Controls */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-3xl font-semibold text-white mb-2">{track.title}</h2>
                                    <p className="text-lg text-gray-400 mb-1">{track.artist?.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {track.genre} • {new Date(track.releaseDate).getFullYear()}
                                    </p>
                                </div>

                                {/* Player Controls */}
                                <div className="flex items-center space-x-6">
                                    <button
                                        onClick={handlePlay}
                                        className="w-12 h-12 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-pink-500/25"
                                    >
                                        <i className="fas fa-play text-white text-lg ml-1"></i>
                                    </button>
                                    <button className="text-gray-400 hover:text-white transition-colors">
                                        <i className="fas fa-step-backward text-xl"></i>
                                    </button>
                                    <button className="text-gray-400 hover:text-white transition-colors">
                                        <i className="fas fa-step-forward text-xl"></i>
                                    </button>
                                    <button className="text-gray-400 hover:text-blue-400 transition-colors">
                                        <i className="fas fa-heart text-lg"></i>
                                    </button>
                                    <button className="text-gray-400 hover:text-blue-400 transition-colors">
                                        <i className="fas fa-share text-lg"></i>
                                    </button>
                                </div>

                                {/* Track Stats */}
                                <div className="flex items-center space-x-6 text-sm text-gray-400">
                                    <span>
                                        <i className="fas fa-play mr-2"></i>
                                        {track.playCount?.toLocaleString() || '2.4M'} plays
                                    </span>
                                    <span>
                                        <i className="fas fa-heart mr-2"></i>
                                        {track.likes?.toLocaleString() || '48K'} likes
                                    </span>
                                    <span>
                                        <i className="fas fa-comment mr-2"></i>1.2K comments
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Audio Progress Bar with Comment Markers */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-8">
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                            <span>1:24</span>
                            <span>4:32</span>
                        </div>
                        <div className="relative">
                            {/* Progress Bar Background */}
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full w-1/3 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full"></div>
                            </div>
                            {/* Comment Markers */}
                            <div className="absolute top-0 w-full h-2">
                                {markers.map((m, idx) => {
                                    const colors = getColorClasses(m.color);
                                    return (
                                        <div
                                            key={idx}
                                            className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full shadow-lg cursor-pointer hover:scale-150 transition-transform"
                                            style={{ left: m.left }}
                                        >
                                            <div className={`w-full h-full ${colors.dot} rounded-full`} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                        <h3 className="text-xl font-semibold mb-6 flex items-center">
                            <i className="fas fa-comments mr-3 text-blue-400"></i>
                            Timeline Comments
                        </h3>

                        {/* Comment Input */}
                        <div className="mb-8">
                            <div className="flex items-center space-x-4">
                                <img
                                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                                    alt="User Avatar"
                                    className="w-10 h-10 rounded-full border border-gray-700"
                                />
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment at current time..."
                                        className="w-full bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-pink-400 transition-colors">
                                        <i className="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-6">
                            {markers.map((m, idx) => {
                                const colors = getColorClasses(m.color);
                                return (
                                    <div key={idx} className="flex items-start space-x-4">
                                        <div
                                            className={`text-xs font-mono px-2 py-1 rounded border whitespace-nowrap ${colors.text} ${colors.bg} ${colors.border}`}
                                        >
                                            {m.time}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-gray-800/50 rounded-2xl px-4 py-3 border border-gray-700">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <img
                                                        src={m.avatar}
                                                        alt={m.user}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                    <span className="text-sm font-medium text-gray-300">
                                                        {m.user}
                                                    </span>
                                                </div>
                                                <p className="text-gray-300 text-sm">{m.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Load More Comments */}
                        <div className="text-center mt-8">
                            <button className="text-blue-400 hover:text-pink-400 transition-colors text-sm font-medium">
                                Load more comments (847 remaining)
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TrackTimelinePage;