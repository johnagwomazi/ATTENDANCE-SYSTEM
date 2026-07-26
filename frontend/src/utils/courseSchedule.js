const CLASS_DAY_OPTIONS = [
  { key: 'Monday', label: 'Monday' },
  { key: 'Tuesday', label: 'Tuesday' },
  { key: 'Wednesday', label: 'Wednesday' },
  { key: 'Thursday', label: 'Thursday' },
  { key: 'Friday', label: 'Friday' },
  { key: 'Saturday', label: 'Saturday' },
  { key: 'Sunday', label: 'Sunday' }
];

const SESSION_OPTIONS = [
  {
    key: 'morning',
    label: 'Morning',
    timeLabel: '9:00 AM - 12:00 PM'
  },
  {
    key: 'afternoon',
    label: 'Afternoon',
    timeLabel: '12:00 PM - 3:00 PM'
  }
];

export const getClassDayOptions = () => CLASS_DAY_OPTIONS;

export const getSessionOptions = () => SESSION_OPTIONS;

export const normalizeClassDays = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item));
  }

  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).map((item) => String(item));
      }
    } catch (_error) {
      // Fall through to CSV parsing.
    }

    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const getClassDaysLabel = (value) => {
  const days = normalizeClassDays(value);
  return days.length ? days.join(' & ') : 'No class days';
};

export const getSessionTimeLabel = (session) => {
  const normalized = String(session || 'morning').toLowerCase();
  return SESSION_OPTIONS.find((option) => option.key === normalized)?.timeLabel || '9:00 AM - 12:00 PM';
};
