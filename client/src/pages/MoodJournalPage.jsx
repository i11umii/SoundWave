import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

const MoodJournalPage = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEntry, setNewEntry] = useState({
        mood: 'happy',
        note: '',
        tags: []
    });

    const moods = [
        { value: 'happy', label: '😊 Happy', color: 'from-yellow-400 to-orange-400' },
        { value: 'sad', label: '😢 Sad', color: 'from-blue-400 to-indigo-400' },
        { value: 'energetic', label: '⚡ Energetic', color: 'from-red-400 to-pink-400' },
        { value: 'calm', label: '😌 Calm', color: 'from-green-400 to-teal-400' },
        { value: 'anxious', label: '😰 Anxious', color: 'from-purple-400 to-violet-400' },
        { value: 'focused', label: '🎯 Focused', color: 'from-cyan-400 to-blue-400' },
        { value: 'romantic', label: '❤️ Romantic', color: 'from-pink-400 to-rose-400' },
        { value: 'melancholic', label: '🌧️ Melancholic', color: 'from-gray-400 to-slate-400' }
    ];

    const popularTags = ['work', 'exercise', 'relaxing', 'commute', 'party', 'study', 'sleep', 'morning', 'evening'];

    useEffect(() => {
        fetchMoodEntries();
    }, []);

    const fetchMoodEntries = async () => {
        setLoading(true);
        try {
            const response = await userAPI.getMoodJournal();
            setEntries(response.data.data || []);
        } catch (error) {
            console.error('Fetch mood entries error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEntry = async () => {
        try {
            await userAPI.addMoodEntry(newEntry);
            setShowAddModal(false);
            setNewEntry({ mood: 'happy', note: '', tags: [] });
            fetchMoodEntries();
        } catch (error) {
            console.error('Add entry error:', error);
        }
    };

    const toggleTag = (tag) => {
        setNewEntry(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMoodEmoji = (mood) => {
        const moodData = moods.find(m => m.value === mood);
        return moodData ? moodData.label.split(' ')[0] : '😊';
    };

    const getMoodColor = (mood) => {
        const moodData = moods.find(m => m.value === mood);
        return moodData ? moodData.color : 'from-gray-400 to-slate-400';
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-900">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <TopNav />
                    <main className="flex-1 flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin text-4xl text-blue-400"></i>
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

                <main className="flex-1 overflow-y-auto pb-32">
                    <div className="max-w-6xl mx-auto px-8 py-12">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    Mood Journal
                                </h1>
                                <p className="text-gray-400">Track your emotions and musical journey</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2"
                            >
                                <i className="fas fa-plus"></i>
                                New Entry
                            </button>
                        </div>

                        {/* Mood Grid */}
                        <div className="grid grid-cols-4 gap-4 mb-8">
                            {moods.map((mood) => {
                                const count = entries.filter(e => e.mood === mood.value).length;
                                return (
                                    <div
                                        key={mood.value}
                                        className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-purple-500 transition-all"
                                    >
                                        <div className={`text-3xl mb-2 bg-gradient-to-r ${mood.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                                            {mood.label.split(' ')[0]}
                                        </div>
                                        <p className="text-sm text-gray-400 mb-1">{mood.label.split(' ')[1]}</p>
                                        <p className="text-2xl font-bold">{count}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Entries Timeline */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Recent Entries</h2>
                            {entries.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">📔</div>
                                    <p className="text-gray-400 mb-4">No mood entries yet</p>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-semibold"
                                    >
                                        Add Your First Entry
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {entries.map((entry) => (
                                        <div
                                            key={entry._id}
                                            className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`text-4xl bg-gradient-to-r ${getMoodColor(entry.mood)} w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0`}>
                                                    {getMoodEmoji(entry.mood)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-lg font-semibold capitalize">{entry.mood}</h3>
                                                        <span className="text-sm text-gray-500">{formatDate(entry.createdAt)}</span>
                                                    </div>
                                                    {entry.note && (
                                                        <p className="text-gray-300 mb-3">{entry.note}</p>
                                                    )}
                                                    {entry.tags && entry.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {entry.tags.map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Add Entry Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Add Mood Entry</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Mood Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                How are you feeling?
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {moods.map((mood) => (
                                    <button
                                        key={mood.value}
                                        onClick={() => setNewEntry({ ...newEntry, mood: mood.value })}
                                        className={`p-4 rounded-xl border-2 transition-all ${newEntry.mood === mood.value
                                                ? `border-purple-500 bg-gradient-to-r ${mood.color}`
                                                : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">{mood.label.split(' ')[0]}</div>
                                        <p className="text-xs">{mood.label.split(' ')[1]}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Note */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Note (optional)
                            </label>
                            <textarea
                                value={newEntry.note}
                                onChange={(e) => setNewEntry({ ...newEntry, note: e.target.value })}
                                placeholder="What's on your mind?"
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white resize-none"
                                rows="4"
                            />
                        </div>

                        {/* Tags */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Tags (optional)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {popularTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-4 py-2 rounded-full text-sm transition-all ${newEntry.tags.includes(tag)
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddEntry}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg font-semibold transition-all"
                            >
                                Save Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoodJournalPage;