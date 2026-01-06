// превращаем секунды в строку вида 3:05
export function formatTime(seconds) {
  if (seconds === undefined || seconds === null) {
    return '0:00';
  }

  if (isNaN(seconds)) {
    return '0:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const paddedSecs = secs.toString().padStart(2, '0');
  return `${mins}:${paddedSecs}`;
}

// превращаем дату в читаемую строку
export function formatDate(date) {
  if (!date) {
    return '';
  }

  const value = new Date(date);
  return value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num || 0);
};

