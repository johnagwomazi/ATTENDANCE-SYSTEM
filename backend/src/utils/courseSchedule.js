const CLASS_DAY_OPTIONS = [
  { key: 'Monday', label: 'Monday' },
  { key: 'Tuesday', label: 'Tuesday' },
  { key: 'Wednesday', label: 'Wednesday' },
  { key: 'Thursday', label: 'Thursday' },
  { key: 'Friday', label: 'Friday' },
  { key: 'Saturday', label: 'Saturday' },
  { key: 'Sunday', label: 'Sunday' }
];

const SESSION_OPTIONS = {
  morning: {
    key: 'morning',
    label: 'Morning',
    startTime: '09:00:00',
    endTime: '12:00:00',
    displayTime: '9:00 AM - 12:00 PM'
  },
  afternoon: {
    key: 'afternoon',
    label: 'Afternoon',
    startTime: '12:00:00',
    endTime: '15:00:00',
    displayTime: '12:00 PM - 3:00 PM'
  }
};

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
      // Ignore non-JSON strings and fall through to CSV parsing.
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

export const getSessionDefinition = (session) => {
  const normalized = String(session || 'morning').toLowerCase();
  return SESSION_OPTIONS[normalized] || SESSION_OPTIONS.morning;
};

export const getSessionOptions = () => Object.values(SESSION_OPTIONS);

export const getClassDayOptions = () => CLASS_DAY_OPTIONS;

export const isCourseOpenOnWeekday = (classDays, weekday) => {
  const days = normalizeClassDays(classDays);
  return days.includes(weekday);
};

export const getSessionTimeLabel = (session) => getSessionDefinition(session).displayTime;
