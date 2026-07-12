const DEFAULT_TIME_ZONE = process.env.APP_TIME_ZONE || 'Africa/Lagos';

export const TIME_ZONE = DEFAULT_TIME_ZONE;

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export const getZonedParts = (date = new Date(), timeZone = TIME_ZONE) => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));

  return {
    date: `${map.year}-${map.month}-${map.day}`,
    weekday: capitalize(map.weekday),
    time: `${map.hour}:${map.minute}:${map.second}`,
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second)
  };
};

export const getCurrentDate = (timeZone = TIME_ZONE) => getZonedParts(new Date(), timeZone).date;
export const getCurrentWeekday = (timeZone = TIME_ZONE) => getZonedParts(new Date(), timeZone).weekday;
export const getCurrentTime = (timeZone = TIME_ZONE) => getZonedParts(new Date(), timeZone).time;

export const timeToMinutes = (timeString = '00:00:00') => {
  const [hours = 0, minutes = 0] = timeString.split(':').map((value) => Number.parseInt(value, 10) || 0);
  return hours * 60 + minutes;
};

export const addMinutesToTime = (timeString, minutesToAdd) => {
  const totalMinutes = timeToMinutes(timeString) + minutesToAdd;
  const hours = Math.floor(((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60) / 60);
  const minutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60) % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

export const isPastDateTime = (dateTimeValue) => new Date(dateTimeValue).getTime() < Date.now();

export const getDateDaysAgo = (daysAgo, referenceDate = new Date()) => {
  const date = new Date(referenceDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return getZonedParts(date).date;
};

export const getMonthStartDate = (referenceDate = new Date()) => {
  const parts = getZonedParts(referenceDate);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-01`;
};

export const isTodayWithinGracePeriod = (startTime, currentTime, graceMinutes = 15) => {
  return timeToMinutes(currentTime) <= timeToMinutes(addMinutesToTime(startTime, graceMinutes));
};

export const getWeekdayOrder = () => WEEKDAY_NAMES;
