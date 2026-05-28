import { useEffect, useMemo, useState } from 'react';
import { fetchCalendar, type CalendarApiDay } from '../services/dashboard';
import { formatLocalDate, getTodayIso } from '../utils/date';

export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState(getTodayIso());
  const [calendarDays, setCalendarDays] = useState<CalendarApiDay[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [calendarLoadError, setCalendarLoadError] = useState<string | null>(null);

  const selectedMonth = useMemo(() => selectedDate.slice(0, 7), [selectedDate]);

  useEffect(() => {
    let cancelled = false;
    setLoadingCalendar(true);
    setCalendarLoadError(null);

    fetchCalendar(selectedMonth)
      .then((cal) => {
        if (!cancelled) {
          setCalendarDays(cal);
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar calendário', error);
        if (!cancelled) {
          setCalendarLoadError('Não foi possível carregar o calendário. Verifique a conexão e tente outra vez.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCalendar(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedMonth]);

  function changeMonth(direction: 'prev' | 'next') {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + (direction === 'prev' ? -1 : 1), 1);
    setSelectedDate(formatLocalDate(date));
  }

  return {
    selectedDate,
    setSelectedDate,
    selectedMonth,
    calendarDays,
    loadingCalendar,
    calendarLoadError,
    changeMonth,
  };
}