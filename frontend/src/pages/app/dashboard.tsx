import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import CalendarGrid from '../../components/calendar/calendar-grid';
import { formatMonthLabel, getTodayIso } from '../../utils/date';
import { useCalendar } from '../../hooks/use-calendar';
import { useDashboardOverview } from '../../hooks/use-dashboard-overview';

type ExpandedSection = 'contracts' | 'dueDates' | null;

export default function DashboardPage() {
  const { search } = useOutletContext<{ search: string }>();
  const { summaryCards, recentContracts, upcomingItems } = useDashboardOverview();
  const { selectedDate, setSelectedDate, selectedMonth, calendarDays, loadingCalendar, calendarLoadError, changeMonth } = useCalendar();
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);

  const searchTerm = search.trim().toLowerCase();
  const filteredContracts = useMemo(
    () =>
      recentContracts.filter((contract) =>
        !searchTerm || `${contract.company} ${contract.service}`.toLowerCase().includes(searchTerm)
      ),
    [recentContracts, searchTerm]
  );
  const filteredUpcomingItems = useMemo(
    () =>
      upcomingItems.filter((item) =>
        !searchTerm || `${item.client} ${item.reference} ${item.priority}`.toLowerCase().includes(searchTerm)
      ),
    [searchTerm, upcomingItems]
  );

  const visibleContracts = expandedSection === 'contracts' ? filteredContracts : filteredContracts.slice(0, 3);
  const visibleDueDates = expandedSection === 'dueDates' ? filteredUpcomingItems : filteredUpcomingItems.slice(0, 3);

  return (
    <>
      <div className="cards-grid">
        {summaryCards.map((card) => (
          <article key={card.title} className="summary-card">
            <strong>{card.title}</strong>
            <h2>{card.value}</h2>
            <small>{card.subtitle}</small>
          </article>
        ))}
      </div>

      <div className="dashboard-grid dashboard-main-grid">
        <section className="panel calendar-panel gc-calendar-panel">
          <div className="panel-header calendar-header">
            <div>
              <h3>Calendário</h3>
              <span>{formatMonthLabel(selectedMonth)}</span>
            </div>
            <div className="calendar-nav">
              <button type="button" className="button button--text gc-calendar-today-btn" onClick={() => setSelectedDate(getTodayIso())}>
                Hoje
              </button>
              <button type="button" className="icon-button" aria-label="Mês anterior" onClick={() => changeMonth('prev')}>
                ◀
              </button>
              <button type="button" className="icon-button" aria-label="Próximo mês" onClick={() => changeMonth('next')}>
                ▶
              </button>
            </div>
          </div>
          <CalendarGrid
            placement="overview"
            calendarDays={calendarDays}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            loadingCalendar={loadingCalendar}
            calendarLoadError={calendarLoadError}
            onSelectDate={setSelectedDate}
          />
        </section>

        <div className="right-side-grid">
          <section className="panel list-panel">
            <div className="panel-header">
              <h3>Últimos contratos gerados</h3>
              <button type="button" className="button button--text" onClick={() => setExpandedSection((current) => current === 'contracts' ? null : 'contracts')}>
                {expandedSection === 'contracts' ? 'Recolher' : 'Ver todos'}
              </button>
            </div>
            <div className="table-list">
              {visibleContracts.length > 0 ? (
                visibleContracts.map((contract) => (
                  <div key={`${contract.company}-${contract.start}`} className="table-row">
                    <div>
                      <strong>{contract.company}</strong>
                      <small>{contract.service}</small>
                    </div>
                    <span>{contract.start}</span>
                  </div>
                ))
              ) : (
                <p className="panel-empty">Nenhum contrato encontrado para o filtro atual.</p>
              )}
            </div>
          </section>

          <section className="panel upcoming-panel">
            <div className="panel-header">
              <h3>Próximos vencimentos</h3>
              <button type="button" className="button button--text" onClick={() => setExpandedSection((current) => current === 'dueDates' ? null : 'dueDates')}>
                {expandedSection === 'dueDates' ? 'Recolher' : 'Ver todos'}
              </button>
            </div>
            <div className="upcoming-list">
              {visibleDueDates.length > 0 ? (
                visibleDueDates.map((item) => (
                  <div key={`${item.client}-${item.reference}`} className="upcoming-row">
                    <div>
                      <strong>{item.client}</strong>
                      <small>{item.reference}</small>
                    </div>
                    <div className="upcoming-meta">
                      <span>{item.due}</span>
                      <span className={`badge badge--${item.priority.toLowerCase()}`}>{item.priority}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="panel-empty">Nenhum vencimento encontrado para o filtro atual.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}