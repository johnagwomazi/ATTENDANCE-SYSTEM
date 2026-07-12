export const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium'
  }).format(new Date(value));
};

export const formatTime = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-NG', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(`1970-01-01T${value}`));
};

export const formatClock = (value) => {
  if (!value) return '-';
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.slice(0, 5);
  }
  return new Intl.DateTimeFormat('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(value));
};

export const formatStatus = (value = '') => value.replace(/_/g, ' ');

export const capitalize = (value = '') => value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
