import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAgenda, type AgendaApiItem } from '../services/dashboard';
import type { AgendaViewMode } from '../types';
import { getSundayWeekDateStrings } from '../utils/calendarWeek';

type UseAgendaParams = {
  selectedDate: string;
  activeOnAgendaPage: boolean;
  searchTerm?: string;
};

export function useAgenda({ selectedDate, activeOnAgendaPage, searchTerm = '' }: UseAgendaParams) {
  const [agendaItems, setAgendaItems] = useState<AgendaApiItem[]>([]);
  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [weekAgendaByDate, setWeekAgendaByDate] = useState<Record<string, AgendaApiItem[]>>({});
  const [loadingWeekAgenda, setLoadingWeekAgenda] = useState(false);
  const [agendaViewMode, setAgendaViewMode] = useState<AgendaViewMode>('semanal');

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const weekDatesForAgenda = useMemo(() => getSundayWeekDateStrings(selectedDate), [selectedDate]);

  const filterAgendaList = useCallback(
    (items: AgendaApiItem[]) => {
      if (!normalizedSearchTerm) {
        return items;
      }
      return items.filter((item) =>
        `${item.title} ${item.company} ${item.status}`.toLowerCase().includes(normalizedSearchTerm)
      );
    },
    [normalizedSearchTerm]
  );

  useEffect(() => {
    if (activeOnAgendaPage && agendaViewMode === 'semanal') {
      return;
    }

    let cancelled = false;
    setLoadingAgenda(true);

    fetchAgenda(selectedDate)
      .then((agenda) => {
        if (!cancelled) {
          setAgendaItems(agenda);
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar agenda do dia', error);
        if (!cancelled) {
          setAgendaItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingAgenda(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeOnAgendaPage, agendaViewMode, selectedDate]);

  useEffect(() => {
    if (!activeOnAgendaPage || agendaViewMode !== 'semanal') {
      setWeekAgendaByDate({});
      return;
    }

    let cancelled = false;
    setLoadingWeekAgenda(true);
    setLoadingAgenda(true);

    Promise.all(weekDatesForAgenda.map((date) => fetchAgenda(date)))
      .then((results) => {
        if (cancelled) {
          return;
        }

        const map: Record<string, AgendaApiItem[]> = {};
        weekDatesForAgenda.forEach((date, index) => {
          map[date] = results[index];
        });

        setWeekAgendaByDate(map);
        setAgendaItems(map[selectedDate] ?? []);
      })
      .catch((error) => {
        console.error('Erro ao carregar semana da agenda', error);
        if (!cancelled) {
          setAgendaItems([]);
          setWeekAgendaByDate({});
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingWeekAgenda(false);
          setLoadingAgenda(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeOnAgendaPage, agendaViewMode, selectedDate, weekDatesForAgenda]);

  function getAgendaWeekItems(dayIndex: number) {
    const iso = weekDatesForAgenda[dayIndex];
    if (!iso) {
      return [];
    }
    return filterAgendaList(weekAgendaByDate[iso] ?? []);
  }

  return {
    agendaItems,
    loadingAgenda,
    weekAgendaByDate,
    loadingWeekAgenda,
    agendaViewMode,
    setAgendaViewMode,
    getAgendaWeekItems,
    filterAgendaList,
    weekDatesForAgenda,
  };
}
