// Date helpers — kept minimal to avoid pulling moment/date-fns.
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

export function toISODate(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
}

export function formatLongDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatShortDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}

export function monthLabel(d) {
  const date = d instanceof Date ? d : new Date(d);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function yearsSince(d) {
  const date = d instanceof Date ? d : new Date(d);
  const diff = Date.now() - date.getTime();
  return diff / (1000 * 60 * 60 * 24 * 365.25);
}

export function daysUntil(d) {
  const date = d instanceof Date ? d : new Date(d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

// Next anniversary: bump year forward until the next occurrence.
export function nextAnniversary(originalDate) {
  const orig = new Date(originalDate);
  const today = new Date();
  const anniversary = new Date(today.getFullYear(), orig.getMonth(), orig.getDate());
  if (anniversary < today) anniversary.setFullYear(today.getFullYear() + 1);
  return anniversary;
}

// Group timeline items by quarter (e.g. "Spring 2023") to build "time cards".
const SEASONS = [
  { name: 'Winter', months: [11, 0, 1] },
  { name: 'Spring', months: [2, 3, 4] },
  { name: 'Summer', months: [5, 6, 7] },
  { name: 'Autumn', months: [8, 9, 10] },
];

export function seasonOf(d) {
  const date = d instanceof Date ? d : new Date(d);
  const month = date.getMonth();
  const season = SEASONS.find((s) => s.months.includes(month));
  // Winter spans Dec→Feb so December belongs to the *next* year's winter.
  const year = season.name === 'Winter' && month === 11
    ? date.getFullYear() + 1
    : date.getFullYear();
  return { key: `${season.name}-${year}`, label: `${season.name} ${year}` };
}
