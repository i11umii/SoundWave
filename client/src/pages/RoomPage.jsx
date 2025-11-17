import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomAPI, trackAPI, userAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';
import { formatTime } from '../utils/helpers';

// Страница конкретной комнаты для совместного прослушивания
const RoomPage = () => {
  const { id } = useParams(); // ID комнаты из URL
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCurrentTrack, setPlaylist, play, pause, isPlaying } = usePlayer();

  // Состояния
  const [room, setRoom] = useState(null); // Данные комнаты
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(''); // Текст нового сообщения в чате
  const [allTracks, setAllTracks] = useState([]); // Все доступные треки для добавления
  const [showAddTrack, setShowAddTrack] = useState(false); // Показывать ли модалку добавления трека
  const [searchQuery, setSearchQuery] = useState(''); // Поиск треков

  // Реф для автоскролла чата
  const messagesEndRef = useRef(null);

  // Загружаем данные комнаты при монтировании и каждые 3 секунды для синхронизации
  useEffect(() => {
    fetchRoom();
    
    // Обновляем данные комнаты каждые 3 секунды
    // Это простой способ синхронизации (в реальном проекте лучше использовать WebSockets)
    const interval = setInterval(fetchRoom, 3000);
    
    return () => clearInterval(interval);
  }, [id]);

  // Автоскролл чата при новых сообщениях
  useEffect(() => {
    scrollToBottom();
  }, [room?.messages]);

  // Загружаем список всех треков для добавления
  useEffect(() => {
    if (showAddTrack) {
      fetchAllTracks();
    }
  }, [showAddTrack]);

  // Функция загрузки данных комнаты
  const fetchRoom = async () => {
    try {
      const response = await roomAPI.getById(id);
      setRoom(response.data.data);
      
      // Если в комнате играет трек, синхронизируем его с плеером
      // (только если мы не хост - хост сам контролирует плеер)
      if (response.data.data.currentTrack && response.data.data.host._id !== user?.id) {
        // Здесь можно добавить логику синхронизации плеера
        // Но для простоты пока оставляем так
      }
    } catch (error) {
      console.error('Error fetching room:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка всех треков
  const fetchAllTracks = async () => {
    try {
      const response = await trackAPI.getAll();
      setAllTracks(response.data.data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  // Автоскролл чата вниз
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Отправить сообщение в чат
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    try {
      await roomAPI.sendMessage(id, message);
      setMessage(''); // Очищаем поле ввода
      fetchRoom(); // Обновляем данные комнаты чтобы увидеть новое сообщение
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Покинуть комнату
  const handleLeaveRoom = async () => {
    try {
      await roomAPI.leave(id);
      navigate('/listen-together');
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  // Добавить трек в плейлист комнаты
  const handleAddTrackToRoom = async (trackId) => {
    try {
      await roomAPI.addToPlaylist(id, trackId);
      setShowAddTrack(false);
      fetchRoom(); // Обновляем данные комнаты
    } catch (error) {
      console.error('Error adding track:', error);
    }
  };

  // Воспроизвести трек (только для хоста)
  const handlePlayTrack = async (track) => {
    // Проверяем что пользователь - хост комнаты
    if (room.host._id !== user?.id) {
      alert('Only the host can control playback');
      return;
    }

    try {
      // Обновляем текущий трек в комнате
      await roomAPI.changeTrack(id, track._id, 0);
      
      // Запускаем трек локально
      setCurrentTrack(track);
      play();
      
      // Обновляем данные комнаты
      fetchRoom();
    } catch (error) {
      console.error('Error changing track:', error);
    }
  };

  // Проверка является ли пользователь хостом
  const isHost = room?.host?._id === user?.id;

  // Фильтрация треков по поиску
  const filteredTracks = allTracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-exclamation-circle text-6xl text-slate-600 mb-4"></i>
              <p className="text-slate-400 mb-4">Room not found</p>
              <button
                onClick={() => navigate('/listen-together')}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full transition-colors"
              >
                Back to Rooms
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

        <main className="flex-1 overflow-hidden flex">
          {/* Левая часть - плейлист */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Шапка комнаты */}
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 px-6 py-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{room.name}</h1>
                  <p className="text-slate-300">
                    Hosted by {room.host.username}
                    {isHost && <span className="ml-2 bg-blue-500 text-xs px-2 py-1 rounded-full">YOU</span>}
                  </p>
                </div>
                
                <button
                  onClick={handleLeaveRoom}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Leave Room
                </button>
              </div>

              {/* Участники */}
              <div className="flex items-center gap-2">
                <i className="fas fa-users text-slate-300"></i>
                <span className="text-sm text-slate-300">
                  {room.participants.length} {room.participants.length === 1 ? 'participant' : 'participants'}:
                </span>
                <div className="flex gap-2">
                  {room.participants.map((p, index) => (
                    <span key={index} className="text-sm bg-slate-800 px-2 py-1 rounded">
                      {p.user.username}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Текущий трек */}
            {room.currentTrack && (
              <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Now Playing</p>
                <div className="flex items-center gap-4">
                  <img
                    src={room.currentTrack.imageUrl}
                    alt={room.currentTrack.title}
                    className="w-16 h-16 rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{room.currentTrack.title}</h3>
                    <p className="text-sm text-slate-400">{room.currentTrack.artist?.name}</p>
                  </div>
                  {room.isPlaying && (
                    <i className="fas fa-volume-up text-blue-400 text-xl animate-pulse"></i>
                  )}
                </div>
              </div>
            )}

            {/* Плейлист комнаты */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Room Playlist</h2>
                <button
                  onClick={() => setShowAddTrack(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Track
                </button>
              </div>

              {room.playlist.length === 0 ? (
                <div className="text-center py-16">
                  <i className="fas fa-music text-6xl text-slate-700 mb-4"></i>
                  <p className="text-slate-400 mb-4">No tracks in playlist yet</p>
                  <button
                    onClick={() => setShowAddTrack(true)}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full transition-colors"
                  >
                    Add First Track
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {room.playlist.map((track, index) => (
                    <TrackItem
                      key={track._id}
                      track={track}
                      index={index}
                      onPlay={() => handlePlayTrack(track)}
                      showAlbum={true}
                      showArtist={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Правая часть - чат */}
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800">
              <h3 className="font-semibold">Chat</h3>
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {room.messages.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <i className="fas fa-comments text-4xl mb-2"></i>
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                room.messages.map((msg, index) => (
                  <div key={index} className={`${msg.user === user?.id ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[80%] ${
                      msg.user === user?.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-800 text-slate-100'
                    } rounded-lg px-3 py-2`}>
                      <p className="text-xs font-semibold mb-1">{msg.username}</p>
                      <p className="text-sm break-words">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Форма отправки сообщения */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Модалка добавления трека */}
      {showAddTrack && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Add Track to Playlist</h2>
              <button
                onClick={() => setShowAddTrack(false)}
                className="text-slate-400 hover:text-white"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Поиск */}
            <div className="p-4 border-b border-slate-700">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search tracks..."
              />
            </div>

            {/* Список треков */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredTracks.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  No tracks found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTracks.slice(0, 20).map((track) => (
                    <div
                      key={track._id}
                      onClick={() => handleAddTrackToRoom(track._id)}
                      className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 cursor-pointer transition-colors"
                    >
                      <img
                        src={track.imageUrl}
                        alt={track.title}
                        className="w-12 h-12 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-slate-400 truncate">{track.artist?.name}</p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;