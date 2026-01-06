import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { trackAPI } from '../utils/api';
import AddToPlaylistModal from './AddToPlaylistModal';

function MusicPlayer() {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);

  const player = usePlayer();
  const currentTrack = player.currentTrack;
  const isPlaying = player.isPlaying;
  const playlist = player.playlist;
  const setCurrentTrack = player.setCurrentTrack;
  const play = player.play;
  const pause = player.pause;
  const isTrackLiked = player.isTrackLiked;
  const toggleLikeLocally = player.toggleLikeLocally;

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  const [repeat, setRepeat] = useState('off');

  const [trackAdded, setTrackAdded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  let isLiked = false;
  if (currentTrack) {
    isLiked = isTrackLiked(currentTrack._id);
  }

  function formatTime(time) {
    if (isNaN(time)) {
      return '0:00';
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  async function handleLikeToggle() {
    if (!currentTrack) {
      return;
    }

    console.log('MusicPlayer: like toggle', currentTrack._id);

    const newStatus = !isLiked;
    toggleLikeLocally(currentTrack._id);

    window.dispatchEvent(
      new CustomEvent('like-change', {
        detail: { track: currentTrack, isLiked: newStatus },
      })
    );

    try {
      if (newStatus) {
        await trackAPI.like(currentTrack._id);
      } else {
        await trackAPI.unlike(currentTrack._id);
      }
    } catch (err) {
      console.log(err);
      toggleLikeLocally(currentTrack._id);
    }
  }

  useEffect(() => {
    if (currentTrack && isPlaying && !trackAdded) {
      setTrackAdded(true);
    }

    if (!currentTrack) {
      setTrackAdded(false);
    }
  }, [currentTrack, isPlaying, trackAdded]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) {
      return;
    }

    if (isPlaying) {
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (error && error.name !== 'AbortError') {
            console.log(error);
          }
        });
      }
    } else {
      audioEl.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) {
      return;
    }

    if (isMuted) {
      audioEl.volume = 0;
    } else {
      audioEl.volume = volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) {
      return;
    }

    if (!currentTrack) {
      return;
    }

    console.log('MusicPlayer: load track', currentTrack._id);

    audioEl.src = currentTrack.audioUrl;
    audioEl.load();
    setTrackAdded(false);

    if (isPlaying) {
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err && err.name !== 'AbortError') {
            console.log(err);
          }
        });
      }
    }
  }, [currentTrack]);

  function handleTimeUpdate() {
    const audioEl = audioRef.current;
    if (!audioEl) {
      return;
    }

    if (!isDraggingProgress) {
      setCurrentTime(audioEl.currentTime);
    }
  }

  function handleLoadedMetadata() {
    const audioEl = audioRef.current;
    if (!audioEl) {
      return;
    }

    setDuration(audioEl.duration);
  }

  function getCurrentIndex() {
    if (!currentTrack) {
      return -1;
    }

    for (let i = 0; i < playlist.length; i += 1) {
      const track = playlist[i];
      if (track && track._id === currentTrack._id) {
        return i;
      }
    }

    return -1;
  }

  function handleEnded() {
    console.log('MusicPlayer: ended');
    setTrackAdded(false);

    if (repeat === 'one') {
      const audioEl = audioRef.current;
      if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play();
      }
      return;
    }

    handleNextTrack(true);
  }

  function handleNextTrack(isAuto) {
    if (playlist.length === 0) {
      return;
    }

    console.log('MusicPlayer: next track', { isAuto: !!isAuto });
    setTrackAdded(false);

    const currentIndex = getCurrentIndex();
    const isLastTrack = currentIndex === playlist.length - 1;

    if (isLastTrack && repeat === 'off' && isAuto) {
      pause();
      return;
    }

    if (shuffle) {
      let randomIndex = 0;
      do {
        randomIndex = Math.floor(Math.random() * playlist.length);
      } while (randomIndex === currentIndex && playlist.length > 1);

      setCurrentTrack(playlist[randomIndex]);
      return;
    }

    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentTrack(playlist[nextIndex]);
  }

  function handlePreviousTrack() {
    if (playlist.length === 0) {
      return;
    }

    console.log('MusicPlayer: prev track');
    setTrackAdded(false);

    if (currentTime > 3) {
      const audioEl = audioRef.current;
      if (audioEl) {
        audioEl.currentTime = 0;
      }
      return;
    }

    const currentIndex = getCurrentIndex();

    if (shuffle) {
      let randomIndex = 0;
      do {
        randomIndex = Math.floor(Math.random() * playlist.length);
      } while (randomIndex === currentIndex && playlist.length > 1);

      setCurrentTrack(playlist[randomIndex]);
      return;
    }

    let prevIndex = currentIndex - 1;
    if (currentIndex === 0) {
      prevIndex = playlist.length - 1;
    }

    setCurrentTrack(playlist[prevIndex]);
  }

  function updateProgressFromEvent(e) {
    const audioEl = audioRef.current;
    const barEl = progressBarRef.current;

    if (!audioEl || !barEl) {
      return;
    }

    const rect = barEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    let percentage = clickX / rect.width;
    if (percentage < 0) {
      percentage = 0;
    }
    if (percentage > 1) {
      percentage = 1;
    }

    const newTime = percentage * duration;
    setCurrentTime(newTime);
    audioEl.currentTime = newTime;
  }

  function handleProgressMouseDown(e) {
    setIsDraggingProgress(true);
    updateProgressFromEvent(e);
  }

  function updateVolumeFromEvent(e) {
    const barEl = volumeBarRef.current;
    if (!barEl) {
      return;
    }

    const rect = barEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    let percentage = clickX / rect.width;
    if (percentage < 0) {
      percentage = 0;
    }
    if (percentage > 1) {
      percentage = 1;
    }

    setVolume(percentage);
    if (percentage > 0 && isMuted) {
      setIsMuted(false);
    }
  }

  function handleVolumeMouseDown(e) {
    setIsDraggingVolume(true);
    updateVolumeFromEvent(e);
  }

  useEffect(() => {
    function handleGlobalMouseMove(e) {
      if (isDraggingProgress) {
        updateProgressFromEvent(e);
      }
      if (isDraggingVolume) {
        updateVolumeFromEvent(e);
      }
    }

    function handleGlobalMouseUp() {
      if (isDraggingProgress) {
        setIsDraggingProgress(false);
      }
      if (isDraggingVolume) {
        setIsDraggingVolume(false);
      }
    }

    if (isDraggingProgress || isDraggingVolume) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingProgress, isDraggingVolume]);

  function toggleRepeat() {
    console.log('MusicPlayer: toggle repeat', repeat);

    if (repeat === 'off') {
      setRepeat('all');
      return;
    }

    if (repeat === 'all') {
      setRepeat('one');
      return;
    }

    setRepeat('off');
  }

  function handleArtistClick(e) {
    e.stopPropagation();

    if (currentTrack && currentTrack.artist && currentTrack.artist._id) {
      console.log('MusicPlayer: artist click', currentTrack.artist._id);
      navigate(`/artist/${currentTrack.artist._id}`);
    }
  }

  function handleQueueTrackClick(track) {
    if (!track) {
      return;
    }

    console.log('MusicPlayer: queue click', track._id);
    setCurrentTrack(track);
    setTrackAdded(false);
  }

  function handleToggleQueue() {
    console.log('MusicPlayer: toggle queue');
    setShowQueue(!showQueue);
  }

  function handleCloseQueue() {
    setShowQueue(false);
  }

  function handleToggleShuffle() {
    console.log('MusicPlayer: toggle shuffle');
    setShuffle(!shuffle);
  }

  function handlePlayPauseClick() {
    if (isPlaying) {
      console.log('MusicPlayer: pause');
      pause();
    } else {
      console.log('MusicPlayer: play');
      play();
    }
  }

  function handleNextClick() {
    handleNextTrack(false);
  }

  function handleToggleMute() {
    console.log('MusicPlayer: toggle mute');
    setIsMuted(!isMuted);
  }

  function handleOpenAddToPlaylist() {
    console.log('MusicPlayer: open add to playlist');
    setShowAddToPlaylist(true);
  }

  function handleCloseAddToPlaylist() {
    console.log('MusicPlayer: close add to playlist');
    setShowAddToPlaylist(false);
  }

  if (!currentTrack) {
    return null;
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = isMuted ? 0 : volume * 100;

  let artistBlock = null;
  if (currentTrack.artist) {
    artistBlock = (
      <button
        type="button"
        onClick={handleArtistClick}
        className="text-xs text-gray-400 hover:text-white hover:underline truncate block"
      >
        {currentTrack.artist.name}
      </button>
    );
  }

  let repeatOneBadgeBlock = null;
  if (repeat === 'one') {
    repeatOneBadgeBlock = (
      <span className="absolute top-0 right-0 flex items-center justify-center w-3 h-3 text-[8px] font-bold bg-blue-500 text-black rounded-full shadow-sm">
        1
      </span>
    );
  }

  let addToPlaylistBlock = null;
  if (showAddToPlaylist) {
    addToPlaylistBlock = <AddToPlaylistModal trackId={currentTrack._id} onClose={handleCloseAddToPlaylist} />;
  }

  return (
    <>
      <div
        onClick={handleCloseQueue}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] transition-opacity ${
          showQueue ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        className={`fixed right-0 top-0 bottom-[100px] w-[400px] bg-slate-800 border-l-4 border-blue-500 z-[9999] transition-transform duration-300 shadow-2xl flex flex-col ${
          showQueue ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-blue-600 to-purple-600 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">🎵 Queue</h3>
            <p className="text-sm text-white/80">{playlist.length} tracks</p>
          </div>
          <button
            type="button"
            onClick={handleCloseQueue}
            className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {playlist.map((track, index) => {
            if (track._id === currentTrack._id) {
              return null;
            }

            return (
              <button
                key={`${track._id}-${index}`}
                type="button"
                onClick={() => handleQueueTrackClick(track)}
                className="w-full flex gap-3 items-center p-3 mx-2 rounded-lg hover:bg-slate-700 transition-all border border-transparent hover:border-blue-500"
              >
                <span className="text-xs text-slate-500 w-6 font-mono">{index + 1}</span>
                <img src={track.imageUrl} alt={track.title} className="w-11 h-11 rounded-md object-cover" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate">{track.title}</p>
                  <p className="text-xs text-slate-400 truncate">{track.artist?.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 px-8 py-6 z-50">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 relative group">
              <img src={currentTrack.imageUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
              <div
                onClick={handleToggleQueue}
                className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer text-white"
              >
                <i className="fas fa-list"></i>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-white text-sm truncate">{currentTrack.title}</h4>
              {artistBlock}
            </div>

            <button
              type="button"
              onClick={handleLikeToggle}
              className={`w-8 h-8 flex items-center justify-center transition-all flex-shrink-0 ${
                isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'
              }`}
            >
              <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
            </button>

            <button
              type="button"
              onClick={handleOpenAddToPlaylist}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-all flex-shrink-0"
              title="Add to Playlist"
            >
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>

          <div className="flex flex-col items-center space-y-2 flex-1 max-w-2xl">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleToggleShuffle}
                className={`w-8 h-8 ${shuffle ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                <i className="fas fa-random text-sm"></i>
              </button>

              <button type="button" onClick={handlePreviousTrack} className="text-gray-400 hover:text-white">
                <i className="fas fa-step-backward"></i>
              </button>

              <button
                type="button"
                onClick={handlePlayPauseClick}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-all text-black"
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </button>

              <button type="button" onClick={handleNextClick} className="text-gray-400 hover:text-white">
                <i className="fas fa-step-forward"></i>
              </button>

              <button
                type="button"
                onClick={toggleRepeat}
                className={`w-8 h-8 relative flex items-center justify-center ${
                  repeat !== 'off' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
                title={`Repeat: ${repeat}`}
              >
                <i className="fas fa-redo text-sm"></i>
                {repeatOneBadgeBlock}
              </button>
            </div>

            <div className="flex items-center space-x-3 w-full">
              <span className="text-xs text-gray-400 min-w-[40px]">{formatTime(currentTime)}</span>

              <div
                ref={progressBarRef}
                onMouseDown={handleProgressMouseDown}
                className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer group"
              >
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div
                    className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg ${
                      isDraggingProgress ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  ></div>
                </div>
              </div>

              <span className="text-xs text-gray-400 min-w-[40px] text-right">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 flex-1 justify-end min-w-0">
            <button
              type="button"
              onClick={handleToggleQueue}
              className={`w-8 h-8 ${showQueue ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              <i className="fas fa-list text-sm"></i>
            </button>

            <button type="button" onClick={handleToggleMute} className="text-gray-400 hover:text-white">
              <i className={`fas ${isMuted || volume === 0 ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
            </button>

            <div
              ref={volumeBarRef}
              onMouseDown={handleVolumeMouseDown}
              className="w-24 h-1 bg-gray-700 rounded-full cursor-pointer group"
            >
              <div className="h-full bg-gray-400 rounded-full relative" style={{ width: `${volumePercentage}%` }}>
                <div
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full ${
                    isDraggingVolume ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {addToPlaylistBlock}
    </>
  );
}

export default MusicPlayer;