export function nowISO(): string {
  return new Date().toISOString();
}

export function todayISODate(): string {
  return formatLocalISODate(new Date());
}

export function formatKoreanDate(date: string): string {
  if (!date) {
    return '-';
  }

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return `${parsed.getMonth() + 1}월 ${parsed.getDate()}일`;
}

export function daysAgoDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatLocalISODate(date);
}

export function yearStartDate(): string {
  return `${new Date().getFullYear()}-01-01`;
}

export function sortByDateDesc<T extends { date?: string; playedAt?: string; createdAt?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const left = a.date ?? a.playedAt ?? a.createdAt ?? '';
    const right = b.date ?? b.playedAt ?? b.createdAt ?? '';
    return right.localeCompare(left);
  });
}

export function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

export function addMonthsToISODate(date: string, amount: number): string {
  const parsed = parseISODate(date);
  parsed.setMonth(parsed.getMonth() + amount);
  return formatLocalISODate(parsed);
}

export function monthLabel(date: string): string {
  const parsed = parseISODate(date);
  return `${parsed.getFullYear()}년 ${parsed.getMonth() + 1}월`;
}

export function getCalendarDates(monthDate: string): string[] {
  const parsed = parseISODate(monthDate);
  const year = parsed.getFullYear();
  const month = parsed.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);
  start.setDate(1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return formatLocalISODate(date);
  });
}

export function isSameMonth(left: string, right: string): boolean {
  return left.slice(0, 7) === right.slice(0, 7);
}

function parseISODate(date: string): Date {
  const parsed = new Date(`${date || todayISODate()}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date(`${todayISODate()}T00:00:00`) : parsed;
}

function formatLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}
