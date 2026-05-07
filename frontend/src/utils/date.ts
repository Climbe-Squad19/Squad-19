import type { UpcomingItem } from '../types';

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayIso(): string {
  return formatLocalDate(new Date());
}

export function formatDueLabel(rawDate: string): string {
  const target = new Date(rawDate);
  const today = new Date();
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return 'vence hoje';
  }
  if (diffDays === 1) {
    return 'em 1 dia';
  }
  return `em ${diffDays} dias`;
}

export function getPriorityByDueDate(rawDate: string): UpcomingItem['priority'] {
  const target = new Date(rawDate);
  const today = new Date();
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) {
    return 'Alta';
  }
  if (diffDays <= 10) {
    return 'Média';
  }
  return 'Baixa';
}

export function formatSelectedDayLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function truncateCalendarText(text: string, max = 26): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 1)}…`;
}

export function formatMonthLabel(monthString: string): string {
  const [year, month] = monthString.split('-').map(Number);
  return new Date(year, month - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
}
