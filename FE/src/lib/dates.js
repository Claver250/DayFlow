export const FIRST_HOUR = 6;
export const LAST_HOUR = 23;
export const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => FIRST_HOUR + i);

// "2026-11-20" in the user's LOCAL time zone (never toISOString, which is UTC)
export const toDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

export const todayKey = () => toDateKey(new Date());

export const fromDateKey = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const addDays = (key, n) => {
    const d = fromDateKey(key);
    d.setDate(d.getDate() + n);
    return toDateKey(d);
};

export const formatHour = (h) => {
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
};

export const formatDayLong = (key) =>
    fromDateKey(key).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

export const formatDayShort = (key) =>
    fromDateKey(key).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

export const relativeDayName = (key) => {
    const t = todayKey();
    if (key === t) return 'Today';
    if (key === addDays(t, 1)) return 'Tomorrow';
    if (key === addDays(t, -1)) return 'Yesterday';
    return null;
};

export const formatTimeNow = (d = new Date()) =>
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
