import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext'; // <--- Важно
import { trackAPI } from '../utils/api';
import AddToPlaylistModal from './AddToPlaylistModal';

const MusicPlayer = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);

  // Достаем новые функции из контекста
  const {
    currentTrack, isPlaying, playlist, setCurrentTrack, play, pause,
    isTrackLiked, toggleLikeLocally // <--- БЕРЕМ ОТСЮДА
  } = usePlayer();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off');
  const [trackAdded, setTrackAdded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  // --- ИСПРАВЛЕНИЕ 1: Убрали локальный useState(isLiked) ---
  // Теперь статус вычисляется на лету из глобального списка
  const isLiked = currentTrack ? isTrackLiked(currentTrack._id) : false;

  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- ИСПРАВЛЕНИЕ 2: Убрали useEffect с checkLikeStatus ---
  // Больше не нужно делать запросы при смене трека, всё уже в памяти контекста.

  // --- ОБРАБОТКА ЛАЙКА ---
  const handleLikeToggle = async () => {
    if (!currentTrack) return;

    const newStatus = !isLiked;

    // 1. Обновляем глобальный контекст
    toggleLikeLocally(currentTrack._id);

    // 2. Отправляем событие (для синхронизации с другими вкладками/списками)
    window.dispatchEvent(new CustomEvent('like-change', {
      detail: { track: currentTrack, isLiked: newStatus }
    }));

    try {
      if (newStatus) {
        await trackAPI.like(currentTrack._id);
      } else {
        await trackAPI.unlike(currentTrack._id);
      }
    } catch (err) {
      console.error("Error toggling like", err);
      toggleLikeLocally(currentTrack._id); // Откат
    }
  };

  // Обработка истории прослушивания
  useEffect(() => {
    if (currentTrack && isPlaying && !trackAdded) {
      // Чтобы не спамить запросами, можно добавить задержку, но пока так:
      // userAPI.addToRecentlyPlayed... (можно оставить как есть)
      setTrackAdded(true);
    }
    if (!currentTrack) setTrackAdded(false);
  }, [currentTrack, isPlaying, trackAdded]);

  // --- ИСПРАВЛЕНИЕ 3: Безопасное воспроизведение ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        // Браузеры возвращают Promise. Если загрузка прервана, он режектится.
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // Игнорируем ошибку "AbortError", это нормально при быстром переключении
            if (error.name !== 'AbortError') {
              console.error('Play error:', error);
            }
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]); // Добавили currentTrack в зависимости

  // Обновление громкости
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Загрузка трека
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      setTrackAdded(false);
      
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name !== 'AbortError') console.error('Play error (load):', error);
          });
        }
      }
    }
  }, [currentTrack]); // Убрали isPlaying отсюда, чтобы не двоилось

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDraggingProgress) setCurrentTime(audioRef.current.currentTime);
  };
  const handleLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };

  const handleEnded = () => {
    setTrackAdded(false);
    if (repeat === 'one') { audioRef.current.currentTime = 0; audioRef.current.play(); }
    else if (repeat === 'all') handleNextTrack();
    else {
      const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
      currentIndex < playlist.length - 1 ? handleNextTrack() : pause();
    }
  };

  const handleNextTrack = () => {
    if (playlist.length === 0) return;
    setTrackAdded(false);
    const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
    if (shuffle) {
      let randomIndex;
      do { randomIndex = Math.floor(Math.random() * playlist.length); } while (randomIndex === currentIndex && playlist.length > 1);
      setCurrentTrack(playlist[randomIndex]);
    } else {
      setCurrentTrack(playlist[(currentIndex + 1) % playlist.length]);
    }
  };

  const handlePreviousTrack = () => {
    if (playlist.length === 0) return;
    setTrackAdded(false);
    if (currentTime > 3) { audioRef.current.currentTime = 0; return; }
    const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
    if (shuffle) {
      let randomIndex;
      do { randomIndex = Math.floor(Math.random() * playlist.length); } while (randomIndex === currentIndex && playlist.length > 1);
      setCurrentTrack(playlist[randomIndex]);
    } else {
      setCurrentTrack(playlist[currentIndex === 0 ? playlist.length - 1 : currentIndex - 1]);
    }
  };

  const updateProgressFromEvent = (e) => {
    if (!audioRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentTime(percentage * duration);
    audioRef.current.currentTime = percentage * duration;
  };

  const handleProgressMouseDown = (e) => { setIsDraggingProgress(true); updateProgressFromEvent(e); };

  const updateVolumeFromEvent = (e) => {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));

    setVolume(percentage);
    if (percentage > 0 && isMuted) setIsMuted(false);
  };

  const handleVolumeMouseDown = (e) => { setIsDraggingVolume(true); updateVolumeFromEvent(e); };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDraggingProgress) updateProgressFromEvent(e);
      if (isDraggingVolume) updateVolumeFromEvent(e);
    };
    const handleGlobalMouseUp = () => {
      if (isDraggingProgress) setIsDraggingProgress(false);
      if (isDraggingVolume) setIsDraggingVolume(false);
    };
    if (isDraggingProgress || isDraggingVolume) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingProgress, isDraggingVolume]);

  const handleArtistClick = (e) => { e.stopPropagation(); if (currentTrack?.artist?._id) navigate(`/artist/${currentTrack.artist._id}`); };
  const handleQueueTrackClick = (track) => { setCurrentTrack(track); setTrackAdded(false); };

  if (!currentTrack) return null;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = isMuted ? 0 : volume * 100;

  return (
    <>
      <div onClick={() => setShowQueue(false)} className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] transition-opacity ${showQueue ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />

      <div className={`fixed right-0 top-0 bottom-[100px] w-[400px] bg-slate-800 border-l-4 border-blue-500 z-[9999] transition-transform duration-300 shadow-2xl flex flex-col ${showQueue ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-blue-600 to-purple-600 flex justify-between items-center">
          <div><h3 className="text-xl font-bold text-white mb-1">🎵 Queue</h3><p className="text-sm text-white/80">{playlist.length} tracks</p></div>
          <button onClick={() => setShowQueue(false)} className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-white">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {playlist.map((track, index) => {
            if (track._id === currentTrack?._id) return null;
            return (
               <button key={`${track._id}-${index}`} onClick={() => handleQueueTrackClick(track)} className="w-full flex gap-3 items-center p-3 mx-2 rounded-lg hover:bg-slate-700 transition-all border border-transparent hover:border-blue-500">
                 <span className="text-xs text-slate-500 w-6 font-mono">{index + 1}</span>
                 <img src={track.imageUrl} alt={track.title} className="w-11 h-11 rounded-md object-cover" />
                 <div className="flex-1 min-w-0 text-left"><p className="text-sm font-medium text-white truncate">{track.title}</p><p className="text-xs text-slate-400 truncate">{track.artist?.name}</p></div>
               </button>
             );
          })}
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 px-8 py-6 z-50">
        <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} />
        <div className="flex items-center justify-between gap-8">

          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 relative group">
              <img src={currentTrack.imageUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
              <div onClick={() => setShowQueue(!showQueue)} className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer text-white">
                <i className="fas fa-list"></i>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-white text-sm truncate">{currentTrack.title}</h4>
              {currentTrack.artist && (
                <button onClick={handleArtistClick} className="text-xs text-gray-400 hover:text-white hover:underline truncate block">
                  {currentTrack.artist.name}
                </button>
              )}
            </div>
            {/* КНОПКА ЛАЙКА - ИСПОЛЬЗУЕТ ПЕРЕМЕННУЮ isLiked, ВЫЧИСЛЕННУЮ ИЗ КОНТЕКСТА */}
            <button 
              onClick={handleLikeToggle}
              className={`w-8 h-8 flex items-center justify-center transition-all flex-shrink-0 ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}
            >
              <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
            </button>

            <button
              onClick={() => setShowAddToPlaylist(true)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-all flex-shrink-0"
              title="Add to Playlist"
            >
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>

          <div className="flex flex-col items-center space-y-2 flex-1 max-w-2xl">
            <div className="flex items-center space-x-4">
              <button onClick={() => setShuffle(!shuffle)} className={`w-8 h-8 ${shuffle ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}><i className="fas fa-random text-sm"></i></button>
              <button onClick={handlePreviousTrack} className="text-gray-400 hover:text-white"><i className="fas fa-step-backward"></i></button>
              <button onClick={() => isPlaying ? pause() : play()} className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-all text-black">
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
              <button onClick={handleNextTrack} className="text-gray-400 hover:text-white"><i className="fas fa-step-forward"></i></button>
              <button onClick={() => { const modes = ['off', 'all', 'one']; setRepeat(modes[(modes.indexOf(repeat) + 1) % 3]); }} className={`w-8 h-8 relative ${repeat !== 'off' ? 'text-blue-400' : 'text-gray-400'}`}>
                <i className="fas fa-redo text-sm"></i>{repeat === 'one' && <span className="absolute text-[10px] font-bold ml-3 mt-2">1</span>}
              </button>
            </div>
            <div className="flex items-center space-x-3 w-full">
              <span className="text-xs text-gray-400 min-w-[40px]">{formatTime(currentTime)}</span>
              <div ref={progressBarRef} onMouseDown={handleProgressMouseDown} className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer group">
                <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full relative" style={{ width: `${progressPercentage}%` }}>
                  <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg ${isDraggingProgress ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
                </div>
              </div>
              <span className="text-xs text-gray-400 min-w-[40px] text-right">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 flex-1 justify-end min-w-0">
            <button onClick={() => setShowQueue(!showQueue)} className={`w-8 h-8 ${showQueue ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}><i className="fas fa-list text-sm"></i></button>
            <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white"><i className={`fas ${isMuted || volume === 0 ? 'fa-volume-mute' : 'fa-volume-up'}`}></i></button>
            <div ref={volumeBarRef} onMouseDown={handleVolumeMouseDown} className="w-24 h-1 bg-gray-700 rounded-full cursor-pointer group">
              <div className="h-full bg-gray-400 rounded-full relative" style={{ width: `${volumePercentage}%` }}>
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full ${isDraggingVolume ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showAddToPlaylist && currentTrack && (
        <AddToPlaylistModal trackId={currentTrack._id} onClose={() => setShowAddToPlaylist(false)} />
      )}
    </>
  );
};

export default MusicPlayer;