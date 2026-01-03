import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { userAPI } from '../utils/api';

const MusicPlayer = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);

  const {
    currentTrack,
    isPlaying,
    playlist,
    setCurrentTrack,
    play,
    pause,
  } = usePlayer();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off');
  const [trackAdded, setTrackAdded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (currentTrack && isPlaying && !trackAdded) {
      userAPI.addToRecentlyPlayed(currentTrack._id).catch(console.error);
      setTrackAdded(true);
    }

    if (!currentTrack) {
      setTrackAdded(false);
    }
  }, [currentTrack, isPlaying, trackAdded]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error('Play error:', err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      setTrackAdded(false);
      
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error('Play error:', err));
      }
    }
  }, [currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDraggingProgress) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setTrackAdded(false);
    
    if (repeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeat === 'all') {
      handleNextTrack();
    } else {
      const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
      if (currentIndex < playlist.length - 1) {
        handleNextTrack();
      } else {
        pause();
      }
    }
  };

  const handleNextTrack = () => {
    if (playlist.length === 0) return;
    setTrackAdded(false);

    const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
    
    if (shuffle) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * playlist.length);
      } while (randomIndex === currentIndex && playlist.length > 1);
      
      setCurrentTrack(playlist[randomIndex]);
    } else {
      const nextIndex = (currentIndex + 1) % playlist.length;
      setCurrentTrack(playlist[nextIndex]);
    }
  };

  const handlePreviousTrack = () => {
    if (playlist.length === 0) return;
    setTrackAdded(false);

    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      return;
    }

    const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
    
    if (shuffle) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * playlist.length);
      } while (randomIndex === currentIndex && playlist.length > 1);
      
      setCurrentTrack(playlist[randomIndex]);
    } else {
      const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
      setCurrentTrack(playlist[prevIndex]);
    }
  };

  const updateProgressFromEvent = (e) => {
    if (!audioRef.current || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;

    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const handleProgressMouseDown = (e) => {
    setIsDraggingProgress(true);
    updateProgressFromEvent(e);
  };

  const handleProgressMouseMove = (e) => {
    if (isDraggingProgress) {
      updateProgressFromEvent(e);
    }
  };

  const handleProgressMouseUp = () => {
    setIsDraggingProgress(false);
  };

  const updateVolumeFromEvent = (e) => {
    if (!volumeBarRef.current) return;

    const rect = volumeBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));

    setVolume(percentage);
    if (percentage > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleVolumeMouseDown = (e) => {
    setIsDraggingVolume(true);
    updateVolumeFromEvent(e);
  };

  const handleVolumeMouseMove = (e) => {
    if (isDraggingVolume) {
      updateVolumeFromEvent(e);
    }
  };

  const handleVolumeMouseUp = () => {
    setIsDraggingVolume(false);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDraggingProgress) {
        handleProgressMouseMove(e);
      }
      if (isDraggingVolume) {
        handleVolumeMouseMove(e);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingProgress) {
        handleProgressMouseUp();
      }
      if (isDraggingVolume) {
        handleVolumeMouseUp();
      }
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeat);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeat(modes[nextIndex]);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleArtistClick = (e) => {
    e.stopPropagation();
    if (currentTrack?.artist?._id) {
      navigate(`/artist/${currentTrack.artist._id}`);
    }
  };

  const handleQueueTrackClick = (track) => {
    setCurrentTrack(track);
    setTrackAdded(false);
  };

  if (!currentTrack) return null;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = isMuted ? 0 : volume * 100;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setShowQueue(false)}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] transition-opacity ${showQueue ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      />

      {/* Queue Sidebar */}
      <div
        className={`fixed right-0 top-0 bottom-[100px] w-[400px] bg-slate-800 border-l-4 border-blue-500 z-[9999] transition-transform duration-300 shadow-2xl flex flex-col ${showQueue ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-blue-600 to-purple-600 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">🎵 Queue</h3>
            <p className="text-sm text-white/80">{playlist.length} tracks in queue</p>
          </div>
          <button
            onClick={() => setShowQueue(false)}
            className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Now Playing */}
        {currentTrack && (
          <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
            <p className="text-xs uppercase text-blue-400 mb-3 font-bold tracking-wide">
              ▶ NOW PLAYING
            </p>
            <div className="flex gap-3 items-center">
              <img
                src={currentTrack.imageUrl}
                alt={currentTrack.title}
                className="w-14 h-14 rounded-lg object-cover shadow-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate mb-1">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-slate-300 truncate">
                  {currentTrack.artist?.name || 'Unknown Artist'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-xs uppercase text-slate-500 px-4 py-3 font-bold tracking-wide">
            ⏭ NEXT UP
          </p>
          {playlist.length === 0 ? (
            <div className="text-center text-slate-500 py-16 px-5">
              <div className="text-5xl mb-4 opacity-30">🎵</div>
              <p className="text-sm font-medium">Queue is empty</p>
            </div>
          ) : (
            playlist.map((track, index) => {
              if (track._id === currentTrack?._id) return null;

              return (
                <button
                  key={`${track._id}-${index}`}
                  onClick={() => handleQueueTrackClick(track)}
                  className="w-full flex gap-3 items-center p-3 mx-2 rounded-lg hover:bg-slate-700 transition-all border border-transparent hover:border-blue-500"
                >
                  <span className="text-xs text-slate-500 w-6 font-mono">
                    {index + 1}
                  </span>
                  <img
                    src={track.imageUrl}
                    alt={track.title}
                    className="w-11 h-11 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate">
                      {track.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {track.artist?.name || 'Unknown Artist'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {formatTime(track.duration)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Music Player Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 px-8 py-6 z-50">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        <div className="flex items-center justify-between gap-8">
          {/* Current Track Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={currentTrack.imageUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-white text-sm truncate">
                {currentTrack.title}
              </h4>
              {currentTrack.artist && (
                <button
                  onClick={handleArtistClick}
                  className="text-xs text-gray-400 hover:text-white hover:underline truncate block"
                >
                  {currentTrack.artist.name}
                </button>
              )}
            </div>
            <button
              onClick={() => { }}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-pink-400 transition-all flex-shrink-0"
            >
              <i className="far fa-heart"></i>
            </button>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center space-y-2 flex-1 max-w-2xl">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleShuffle}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${shuffle ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <i className="fas fa-random text-sm"></i>
              </button>
              <button
                onClick={handlePreviousTrack}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              >
                <i className="fas fa-step-backward"></i>
              </button>
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-all"
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-gray-900 ${!isPlaying && 'ml-0.5'}`}></i>
              </button>
              <button
                onClick={handleNextTrack}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              >
                <i className="fas fa-step-forward"></i>
              </button>
              <button
                onClick={toggleRepeat}
                className={`w-8 h-8 flex items-center justify-center transition-colors relative ${repeat !== 'off' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <i className={`fas fa-redo text-sm`}></i>
                {repeat === 'one' && (
                  <span className="absolute text-[10px] font-bold ml-3 mt-2">1</span>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-3 w-full">
              <span className="text-xs text-gray-400 min-w-[40px]">{formatTime(currentTime)}</span>
              <div
                ref={progressBarRef}
                onMouseDown={handleProgressMouseDown}
                className={`flex-1 h-2 bg-gray-700 rounded-full overflow-hidden cursor-pointer transition-all group ${isDraggingProgress ? 'h-3' : 'hover:h-3'
                  }`}
              >
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full relative transition-colors"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-opacity ${isDraggingProgress ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}></div>
                </div>
              </div>
              <span className="text-xs text-gray-400 min-w-[40px] text-right">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Controls + Queue Button */}
          <div className="flex items-center space-x-3 flex-1 justify-end min-w-0">
            {/* КНОПКА QUEUE - ПРОСТАЯ FONT AWESOME */}
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`w-8 h-8 flex items-center justify-center transition-colors ${showQueue
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              <i className="fas fa-list text-sm"></i>
            </button>
            <button
              onClick={toggleMute}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <i className={`fas ${isMuted || volume === 0 ? 'fa-volume-mute' : volume < 0.5 ? 'fa-volume-down' : 'fa-volume-up'}`}></i>
            </button>
            <div
              ref={volumeBarRef}
              onMouseDown={handleVolumeMouseDown}
              className={`w-24 h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer transition-all group ${isDraggingVolume ? 'h-2' : 'hover:h-2'
                }`}
            >
              <div
                className="h-full bg-gray-400 rounded-full relative transition-colors"
                style={{ width: `${volumePercentage}%` }}
              >
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg transition-opacity ${isDraggingVolume ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default MusicPlayer;