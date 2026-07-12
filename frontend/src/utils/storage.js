const HISTORY_KEY = 'nh_attendance_history';

export const loadHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveHistory = (items) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
};

export const pushHistory = (item) => {
  const current = loadHistory();
  const next = [item, ...current].slice(0, 200);
  saveHistory(next);
  return next;
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};
