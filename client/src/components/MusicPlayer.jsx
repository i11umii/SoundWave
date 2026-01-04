import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { trackAPI } from '../utils/api';
import AddToPlaylistModal from './AddToPlaylistModal';

const MusicPlayer = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);

  const {
    currentTrack, isPlaying, playlist, setCurrentTrack, play, pause,
    isTrackLiked, toggleLikeLocally
  } = usePlayer();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  // РЕЖИМЫ: 'off' (нет) -> 'all' (список по кругу) -> 'one' (один трек)
  const [repeat, setRepeat] = useState('off');

  const [trackAdded, setTrackAdded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  // Вычисляем статус лайка
  const isLiked = currentTrack ? isTrackLiked(currentTrack._id) : false;

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleLikeToggle = async () => {
    if (!currentTrack) return;
    const newStatus = !isLiked;
    toggleLikeLocally(currentTrack._id);
    window.dispatchEvent(new CustomEvent('like-change', {
      detail: { track: currentTrack, isLiked: newStatus }
    }));
    try {
      if (newStatus) await trackAPI.like(currentTrack._id);
      else await trackAPI.unlike(currentTrack._id);
    } catch (err) {
      console.error("Error toggling like", err);
      toggleLikeLocally(currentTrack._id);
    }
  };

  useEffect(() => {
    if (currentTrack && isPlaying && !trackAdded) {
      setTrackAdded(true);
    }
    if (!currentTrack) setTrackAdded(false);
  }, [currentTrack, isPlaying, trackAdded]);

  // --- ЛОГИКА АУДИО ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name !== 'AbortError') console.error('Play error:', error);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      setTrackAdded(false);
      // Если был Play, продолжаем играть новый трек
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => { if (err.name !== 'AbortError') console.error(err) });
        }
      }
    }
  }, [currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDraggingProgress) setCurrentTime(audioRef.current.currentTime);
  };
  const handleLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };

  // --- САМОЕ ГЛАВНОЕ: ЧТО ДЕЛАТЬ, КОГДА ТРЕК КОНЧИЛСЯ ---
  const handleEnded = () => {
    setTrackAdded(false);

    // 1. Если включен повтор ОДНОГО трека ('one')
    if (repeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // Перемотать в начало
        audioRef.current.play();          // Запустить заново
      }
      return; // ВАЖНО: Выходим, чтобы не переключить трек
    }

    // 2. Если повтор ВСЕГО ('all') или ВЫКЛ ('off')
    handleNextTrack(true); // Передаем флаг, что это автоматическое переключение
  };

  // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ВПЕРЕД ---
  const handleNextTrack = (isAuto = false) => {
    if (playlist.length === 0) return;
    setTrackAdded(false);

    const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
    const isLastTrack = currentIndex === playlist.length - 1;

    // Если это конец списка И повтор выключен И это авто-переключение -> Останавливаемся
    if (isLastTrack && repeat === 'off' && isAuto) {
      pause();
      return;
    }

    // Иначе переключаем
    if (shuffle) {
      let randomIndex;
      do { randomIndex = Math.floor(Math.random() * playlist.length); } while (randomIndex === currentIndex && playlist.length > 1);
      setCurrentTrack(playlist[randomIndex]);
    } else {
      // Если последний трек и repeat='all' -> переходим на 0. Иначе просто +1
      const nextIndex = (currentIndex + 1) % playlist.length;
      setCurrentTrack(playlist[nextIndex]);
    }
  };

  const handlePreviousTrack = () => {
    if (playlist.length === 0) return;
    setTrackAdded(false);

    // Если трек играет уже больше 3 сек, кнопка "Назад" просто начинает его сначала
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        // Если было на паузе, можно оставить на паузе, или запустить play()
      }
      return;
    }

    const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
    if (shuffle) {
      let randomIndex;
      do { randomIndex = Math.floor(Math.random() * playlist.length); } while (randomIndex === currentIndex && playlist.length > 1);
      setCurrentTrack(playlist[randomIndex]);
    } else {
      const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
      setCurrentTrack(playlist[prevIndex]);
    }
  };

  // --- UI DRAG & DROP ---
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

  // Переключатель режимов повтора
  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const nextIndex = (modes.indexOf(repeat) + 1) % modes.length;
    setRepeat(modes[nextIndex]);
  };

  const handleArtistClick = (e) => { e.stopPropagation(); if (currentTrack?.artist?._id) navigate(`/artist/${currentTrack.artist._id}`); };
  const handleQueueTrackClick = (track) => { setCurrentTrack(track); setTrackAdded(false); };

  if (!currentTrack) return null;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = isMuted ? 0 : volume * 100;

  return (
    <>
      {/* QUEUE SIDEBAR */}
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

          {/* TRACK INFO */}
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
            <button onClick={handleLikeToggle} className={`w-8 h-8 flex items-center justify-center transition-all flex-shrink-0 ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}>
              <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
            </button>
            <button onClick={() => setShowAddToPlaylist(true)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-all flex-shrink-0" title="Add to Playlist">
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-col items-center space-y-2 flex-1 max-w-2xl">
            <div className="flex items-center space-x-4">
              {/* Shuffle */}
              <button onClick={() => setShuffle(!shuffle)} className={`w-8 h-8 ${shuffle ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>
                <i className="fas fa-random text-sm"></i>
              </button>

              {/* Prev */}
              <button onClick={handlePreviousTrack} className="text-gray-400 hover:text-white"><i className="fas fa-step-backward"></i></button>

              {/* Play/Pause */}
              <button onClick={() => isPlaying ? pause() : play()} className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-all text-black">
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </button>

              {/* Next */}
              <button onClick={() => handleNextTrack(false)} className="text-gray-400 hover:text-white"><i className="fas fa-step-forward"></i></button>

              {/* REPEAT BUTTON */}
              <button
                onClick={toggleRepeat}
                className={`w-8 h-8 relative flex items-center justify-center ${repeat !== 'off' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                title={`Repeat: ${repeat}`}
              >
                <i className="fas fa-redo text-sm"></i>
                {repeat === 'one' && (
                  <span className="absolute top-0 right-0 flex items-center justify-center w-3 h-3 text-[8px] font-bold bg-blue-500 text-black rounded-full shadow-sm">1</span>
                )}
              </button>
            </div>

            {/* PROGRESS BAR */}
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

          {/* VOLUME & OPTIONS */}
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