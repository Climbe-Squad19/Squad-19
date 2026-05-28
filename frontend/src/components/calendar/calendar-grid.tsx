import { Fragment } from 'react';
import { Tooltip, Zoom } from '@mui/material';
import { CALENDAR_WEEKDAY_LABELS, GC_EVENT_COLORS } from '../../constants/calendar';
import type { CalendarApiDay } from '../../services/dashboard';
import { getTodayIso, truncateCalendarText } from '../../utils/date';

type CalendarGridProps = {
  placement: 'overview' | 'agenda';
  calendarDays: CalendarApiDay[];
  selectedDate: string;
  selectedMonth: string;
  loadingCalendar: boolean;
  calendarLoadError: string | null;
  onSelectDate: (date: string) => void;
};

export default function CalendarGrid({
  placement,
  calendarDays,
  selectedDate,
  selectedMonth,
  loadingCalendar,
  calendarLoadError,
  onSelectDate,
}: CalendarGridProps) {
  const [year, month] = selectedMonth.split('-').map(Number);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const todayIso = getTodayIso();
  const titleMax = placement === 'agenda' ? 34 : 24;

  return (
    <>
      {calendarLoadError ? <p className="calendar-load-error">{calendarLoadError}</p> : null}
      <div className={`calendar-grid gc-calendar-grid ${loadingCalendar ? 'gc-calendar-grid--loading' : ''}`}>
        {CALENDAR_WEEKDAY_LABELS.map((day) => (
          <span key={`${placement}-wd-${day}`} className="calendar-day label gc-calendar-weekday-label">
            {day}
          </span>
        ))}
        {Array.from({ length: firstWeekday }).map((_, index) => (
          <span key={`${placement}-empty-${index}`} className="calendar-day calendar-day--empty" />
        ))}
        {calendarDays.map((day) => {
          const formattedDate = `${selectedMonth}-${String(day.day).padStart(2, '0')}`;
          const isToday = formattedDate === todayIso;
          const events = day.events ?? [];
          const shown = events.slice(0, 3);
          const useFallbackChips = shown.length === 0 && (day.eventCount > 0 || day.hasEvents);
          const chipsToRender = useFallbackChips
            ? [{ id: -(day.day + 1000), title: `${day.eventCount || 1} compromisso(s)`, time: '' }]
            : shown;
          const moreCount = useFallbackChips ? 0 : day.eventCount > 3 ? day.eventCount - shown.length : 0;
          const tip =
            events.length > 0
              ? events.map((event) => `${event.time} · ${event.title}`).join('\n')
              : useFallbackChips
                ? `${day.eventCount || 1} compromisso(s) neste dia — abra a agenda do dia para ver detalhes.`
                : '';

          const dayButton = (
            <button
              type="button"
              className={`gc-calendar-day ${selectedDate === formattedDate ? 'gc-calendar-day--selected' : ''} ${isToday ? 'gc-calendar-day--today' : ''}`}
              onClick={() => onSelectDate(formattedDate)}
            >
              <div className="gc-calendar-day__num-row">
                <span className="gc-calendar-day__num">{day.day}</span>
              </div>
              <div className="gc-calendar-day__chips">
                {chipsToRender.map((event, index) => (
                  <div
                    key={event.id}
                    className={`gc-event-chip ${!event.time ? 'gc-event-chip--compact' : ''}`}
                    style={{ borderLeftColor: GC_EVENT_COLORS[index % GC_EVENT_COLORS.length] }}
                  >
                    {event.time ? <span className="gc-event-chip__time">{event.time}</span> : null}
                    <span className="gc-event-chip__title">{truncateCalendarText(event.title, titleMax)}</span>
                  </div>
                ))}
                {moreCount > 0 ? <div className="gc-event-more">+{moreCount} mais</div> : null}
              </div>
            </button>
          );

          if (!tip) {
            return <Fragment key={`${placement}-day-${day.day}`}>{dayButton}</Fragment>;
          }

          return (
            <Tooltip
              key={`${placement}-day-${day.day}`}
              title={<span style={{ whiteSpace: 'pre-line', display: 'block', maxWidth: 280 }}>{tip}</span>}
              arrow
              slots={{ transition: Zoom }}
            >
              {dayButton}
            </Tooltip>
          );
        })}
      </div>
    </>
  );
}