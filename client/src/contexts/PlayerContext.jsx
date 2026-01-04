import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../utils/api'; // Импортируем API

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- НОВОЕ: ГЛОБАЛЬНЫЙ СПИСОК ЛАЙКОВ ---
  const [likedTrackIds, setLikedTrackIds] = useState([]); 

  // Функция для обновления списка лайков (вызовем при старте приложения)
  const refreshLikedTracks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await userAPI.getLikedTracks();
      // Сохраняем ТОЛЬКО ID и приводим всё к строкам для надежности
      setLikedTrackIds(res.data.data.map(t => t._id.toString()));
    } catch (err) {
      console.error("Error fetching liked tracks:", err);
    }
  };

  // Загружаем лайки при первом запуске
  useEffect(() => {
    refreshLikedTracks();
  }, []);

  // Хелпер: проверить, лайкнут ли трек (безопасное сравнение)
  const isTrackLiked = (trackId) => {
    return likedTrackIds.includes(trackId?.toString());
  };

  // Хелпер: переключить лайк (обновляет локальный список мгновенно)
  const toggleLikeLocally = (trackId) => {
    const id = trackId.toString();
    setLikedTrackIds(prev =>
      prev.includes(id)
        ? prev.filter(lid => lid !== id) // Убрать
        : [...prev, id] // Добавить
    );
  };
  // ----------------------------------------

  // 1. STATE ДЛЯ АРТИСТОВ
  const [followedArtistIds, setFollowedArtistIds] = useState([]);

  // 2. ФУНКЦИЯ ЗАГРУЗКИ
  const refreshFollowedArtists = async () => {
    try {
      // Внимание: нужно добавить этот метод в api.js
      const res = await userAPI.getFollowedArtists();
      setFollowedArtistIds(res.data.data.map(a => a._id.toString()));
    } catch (err) {
      console.error("Error fetching followed artists", err);
    }
  };

  // 3. ЗАГРУЖАЕМ ПРИ СТАРТЕ (вместе с лайками)
  useEffect(() => {
    refreshLikedTracks();
    refreshFollowedArtists(); // <--- Добавили
  }, []);

  // 4. ХЕЛПЕРЫ
  const isArtistFollowed = (artistId) => {
    return followedArtistIds.includes(artistId?.toString());
  };

  const toggleFollowLocally = (artistId) => {
    const id = artistId.toString();
    setFollowedArtistIds(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const play = (track) => {
    if (track) {
      setCurrentTrack(track);
      if (!playlist.find(t => t._id === track._id)) {
        setPlaylist([track, ...playlist]);
      }
    }
    setIsPlaying(true);
  };

  const pause = () => setIsPlaying(false);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      playlist,
      isPlaying,
      setPlaylist,
      setCurrentTrack,
      play,
      pause,
      // Экспортируем новые функции
      likedTrackIds,
      refreshLikedTracks,
      isTrackLiked,
      toggleLikeLocally,
      isArtistFollowed,
      toggleFollowLocally,
      refreshFollowedArtists,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};