/** Demo openings for the estimate calendar. A real scheduler replaces this. */

export type Opening = { h: number; est: string };

export type TimeSlot = {
  key: string;
  dayKey: string;
  short: string;
  long: string;
  time: string;
  end: string;
  est: string;
};

export type DayCell = {
  id: string;
  key: string;
  dow: string;
  num: number;
  off: boolean;
  aria: string;
  count: number;
  long: string;
};

export type SlotGroup = { name: string; slots: Array<TimeSlot & { id: string }> };

const estimators = ['Brad', 'Luis', 'Dana'];

export function atNoon(date: Date) {
  const next = new Date(date);
  next.setHours(12, 0, 0, 0);
  return next;
}

export function tomorrow() {
  const date = atNoon(new Date());
  date.setDate(date.getDate() + 1);
  return date;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatHour(hour: number) {
  if (hour === 12) return '12:00 PM';
  if (hour > 12) return `${hour - 12}:00 PM`;
  return `${hour}:00 AM`;
}

export function slotsFor(date: Date): Opening[] {
  const day = date.getDay();
  const n = date.getDate();
  if (day === 0 || n % 6 === 0) return [];
  const hours = day === 6 ? [8, 9, 10, 11, 13, 14] : [8, 9, 10, 11, 13, 14, 15, 16];
  return hours
    .filter((hour) => (n * 7 + hour * 3) % 5 !== 0 && (n + hour) % 4 !== 1)
    .map((hour) => ({ h: hour, est: estimators[(n + hour) % 3] ?? 'Brad' }));
}

export function makeSlot(date: Date, opening: Opening): TimeSlot {
  return {
    key: `${date.toDateString()}-${opening.h}`,
    dayKey: date.toDateString(),
    short: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    long: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    time: formatHour(opening.h),
    end: formatHour(opening.h + 1),
    est: opening.est,
  };
}

export function soonestOpening(start = tomorrow()) {
  for (let index = 0; index < 42; index += 1) {
    const date = addDays(start, index);
    const opening = slotsFor(date)[0];
    if (opening) return { date, opening, slot: makeSlot(date, opening), weekOff: Math.floor(index / 7) };
  }
  return null;
}

export function weekRange(weekOff: number, start = tomorrow()) {
  const from = addDays(start, weekOff * 7);
  const to = addDays(from, 6);
  const label = from.getMonth() === to.getMonth()
    ? `${from.toLocaleDateString('en-US', { month: 'short' })} ${from.getDate()} – ${to.getDate()}`
    : `${from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  return { from, label };
}

export function weekDays(weekOff: number, start = tomorrow()): DayCell[] {
  const { from } = weekRange(weekOff, start);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(from, index);
    const openings = date < start ? [] : slotsFor(date);
    const long = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const off = openings.length === 0;
    const count = openings.length;
    return {
      id: `q-day${index}`,
      key: date.toDateString(),
      dow: date.toLocaleDateString('en-US', { weekday: 'short' }),
      num: date.getDate(),
      off,
      count,
      long,
      aria: `${long}${off ? ', no openings' : `, ${count} ${count === 1 ? 'time open' : 'times open'}`}`,
    };
  });
}

export function dateFromKey(key: string) {
  const date = new Date(key);
  date.setHours(12, 0, 0, 0);
  return date;
}

export function slotGroups(viewKey: string, start = tomorrow()): SlotGroup[] {
  if (!viewKey) return [];
  const date = dateFromKey(viewKey);
  if (Number.isNaN(date.getTime()) || date < start) return [];
  const openings = slotsFor(date);
  let id = 0;
  const groups = [
    ['Morning', openings.filter((opening) => opening.h < 12)],
    ['Afternoon', openings.filter((opening) => opening.h >= 12)],
  ] as const;
  return groups.filter((group) => group[1].length > 0).map(([name, list]) => ({
    name: `${name} · ${list.length}`,
    slots: list.map((opening) => ({ ...makeSlot(date, opening), id: `q-slot${id++}` })),
  }));
}
