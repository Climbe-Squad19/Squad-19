import { useState, useEffect, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import CalendarGrid from '../../components/calendar/calendar-grid';
import { CALENDAR_WEEKDAY_LABELS } from '../../constants/calendar';
import { formatMonthLabel, formatSelectedDayLong, getTodayIso } from '../../utils/date';
import { useAgenda } from '../../hooks/use-agenda';
import { useCalendar } from '../../hooks/use-calendar';
import {
  createMeeting,
  fetchPersistedMeetingRecordings,
  syncMeetingRecordings,
  syncMeetingRecordingsBulk,
  type PersistedMeetRecordingApi,
} from '../../services/dashboard';
import { fetchEmpresas, type EmpresaApiResponse } from '../../services/empresas';

export default function AgendaPage() {
  const { search } = useOutletContext<{ search: string }>();
  const { selectedDate, setSelectedDate, selectedMonth, calendarDays, loadingCalendar, calendarLoadError, changeMonth } = useCalendar();
  const { agendaItems, loadingAgenda, loadingWeekAgenda, agendaViewMode, setAgendaViewMode, getAgendaWeekItems, filterAgendaList, weekDatesForAgenda } = useAgenda({
    selectedDate,
    activeOnAgendaPage: true,
    searchTerm: search,
  });
  const [showAgendaCreatePanel, setShowAgendaCreatePanel] = useState(false);
  const [formTitle, setFormTitle] = useState('Nova reunião');
  const [formTime, setFormTime] = useState('09:00');
  const [formPresencial, setFormPresencial] = useState(true);
  const [formLocation, setFormLocation] = useState('Sala 2');
  const [formLinkOnline, setFormLinkOnline] = useState('https://meet.google.com/abc-defg-hij');
  const [formEmpresaId, setFormEmpresaId] = useState('');
  const [empresas, setEmpresas] = useState<EmpresaApiResponse[]>([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [recordingsByMeeting, setRecordingsByMeeting] = useState<Record<number, PersistedMeetRecordingApi[]>>({});
  const [recordingsLoadingByMeeting, setRecordingsLoadingByMeeting] = useState<Record<number, boolean>>({});
  const [recordingsErrorByMeeting, setRecordingsErrorByMeeting] = useState<Record<number, string>>({});
  const [expandedMeetings, setExpandedMeetings] = useState<Record<number, boolean>>({});
  const [bulkSyncDays, setBulkSyncDays] = useState('14');
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [bulkSyncFeedback, setBulkSyncFeedback] = useState('');

  const filteredAgendaItems = filterAgendaList(agendaItems);
  const onlineMeetItems = filteredAgendaItems.filter(
    (item) => !item.presencial && item.linkOnline?.includes('meet.google.com')
  );

  useEffect(() => {
    if (showAgendaCreatePanel && empresas.length === 0) {
      fetchEmpresas()
        .then(setEmpresas)
        .catch(() => setFormError('Não foi possível carregar empresas.'));
    }
  }, [showAgendaCreatePanel]);

  async function handleCreateMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    try {
      await createMeeting({
        pauta: formTitle,
        empresaId: formEmpresaId ? Number(formEmpresaId) : 1,
        contratoId: 1,
        dataHora: `${selectedDate}T${formTime}:00`,
        presencial: formPresencial,
        linkOnline: formPresencial ? '' : formLinkOnline,
        sala: formPresencial ? formLocation : '',
        participantesIds: [1],
      });
      setShowAgendaCreatePanel(false);
    } catch {
      setFormError('Não foi possível agendar a reunião.');
    } finally {
      setFormSubmitting(false);
    }
  }

  async function loadPersistedRecordings(meetingId: number) {
    setRecordingsLoadingByMeeting((current) => ({ ...current, [meetingId]: true }));
    setRecordingsErrorByMeeting((current) => ({ ...current, [meetingId]: '' }));
    try {
      const recordings = await fetchPersistedMeetingRecordings(meetingId);
      setRecordingsByMeeting((current) => ({ ...current, [meetingId]: recordings }));
    } catch {
      setRecordingsErrorByMeeting((current) => ({
        ...current,
        [meetingId]: 'Não foi possível carregar gravações sincronizadas.',
      }));
    } finally {
      setRecordingsLoadingByMeeting((current) => ({ ...current, [meetingId]: false }));
    }
  }

  async function handleSyncRecordingsByMeeting(meetingId: number) {
    setRecordingsLoadingByMeeting((current) => ({ ...current, [meetingId]: true }));
    setRecordingsErrorByMeeting((current) => ({ ...current, [meetingId]: '' }));
    try {
      const recordings = await syncMeetingRecordings(meetingId);
      setRecordingsByMeeting((current) => ({ ...current, [meetingId]: recordings }));
      setExpandedMeetings((current) => ({ ...current, [meetingId]: true }));
    } catch {
      setRecordingsErrorByMeeting((current) => ({
        ...current,
        [meetingId]: 'Falha ao sincronizar gravações desta reunião.',
      }));
    } finally {
      setRecordingsLoadingByMeeting((current) => ({ ...current, [meetingId]: false }));
    }
  }

  async function handleToggleRecordings(meetingId: number) {
    const willExpand = !expandedMeetings[meetingId];
    setExpandedMeetings((current) => ({ ...current, [meetingId]: willExpand }));
    if (!willExpand) {
      return;
    }
    if (recordingsByMeeting[meetingId] !== undefined || recordingsLoadingByMeeting[meetingId]) {
      return;
    }
    await loadPersistedRecordings(meetingId);
  }

  async function handleBulkSync() {
    const parsedDays = Number.parseInt(bulkSyncDays, 10);
    if (Number.isNaN(parsedDays) || parsedDays <= 0) {
      setBulkSyncFeedback('Informe um número válido de dias retroativos.');
      return;
    }

    setBulkSyncing(true);
    setBulkSyncFeedback('');
    try {
      const result = await syncMeetingRecordingsBulk(parsedDays);
      setBulkSyncFeedback(`${result.reunioesAtualizadas} reunião(ões) atualizada(s) no sync em lote.`);

      const meetingIdsToRefresh = Object.keys(expandedMeetings)
        .filter((id) => expandedMeetings[Number(id)])
        .map((id) => Number(id));

      await Promise.all(meetingIdsToRefresh.map((meetingId) => loadPersistedRecordings(meetingId)));
    } catch {
      setBulkSyncFeedback('Não foi possível sincronizar gravações em lote.');
    } finally {
      setBulkSyncing(false);
    }
  }

  function renderMeetAutomationPanel() {
    return (
      <section className="panel agenda-day-insight" aria-labelledby="agenda-meet-recordings-heading" style={{ marginTop: 12 }}>
        <div className="agenda-day-insight__head">
          <div>
            <h4 id="agenda-meet-recordings-heading" className="agenda-day-insight__title">Gravações Google Meet</h4>
            <p className="agenda-day-insight__date">Sincronize e visualize gravações persistidas da API.</p>
          </div>
          <span className="agenda-day-insight__badge">{onlineMeetItems.length} reunião(ões) online</span>
        </div>

        <div className="agenda-form-row" style={{ marginBottom: 10 }}>
          <label style={{ flex: 1 }}>
            Dias retroativos
            <input
              type="number"
              min={1}
              max={90}
              value={bulkSyncDays}
              onChange={(event) => setBulkSyncDays(event.target.value)}
            />
          </label>
          <label style={{ alignSelf: 'end' }}>
            <span style={{ opacity: 0 }}>.</span>
            <button
              type="button"
              className="button button--outline"
              disabled={bulkSyncing}
              onClick={() => void handleBulkSync()}
            >
              {bulkSyncing ? 'Sincronizando...' : 'Sync em lote'}
            </button>
          </label>
        </div>

        {bulkSyncFeedback ? <p style={{ marginTop: 0 }}>{bulkSyncFeedback}</p> : null}

        {onlineMeetItems.length === 0 ? (
          <p className="panel-empty">Nenhuma reunião do dia com link do Google Meet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {onlineMeetItems.map((item) => {
              const recordings = recordingsByMeeting[item.id] ?? [];
              const isExpanded = Boolean(expandedMeetings[item.id]);
              const isLoading = Boolean(recordingsLoadingByMeeting[item.id]);
              const error = recordingsErrorByMeeting[item.id];

              return (
                <article key={`meet-rec-${item.id}`} className="agenda-week-item-card" style={{ gap: 8 }}>
                  <strong>{item.title}</strong>
                  <small>{item.company} · {item.time ? item.time.slice(0, 5) : ''}</small>
                  <small>{item.location || item.linkOnline}</small>

                  <div className="section-actions" style={{ gap: 8 }}>
                    <button
                      type="button"
                      className="button button--outline"
                      disabled={isLoading}
                      onClick={() => void handleSyncRecordingsByMeeting(item.id)}
                    >
                      {isLoading ? 'Sincronizando...' : 'Sincronizar reunião'}
                    </button>
                    <button
                      type="button"
                      className="button button--outline"
                      onClick={() => void handleToggleRecordings(item.id)}
                    >
                      {isExpanded ? 'Ocultar gravações' : 'Ver gravações'}
                    </button>
                    <a className="button button--text" href={item.linkOnline} target="_blank" rel="noreferrer">
                      Abrir Meet
                    </a>
                  </div>

                  {isExpanded ? (
                    <div style={{ display: 'grid', gap: 6 }}>
                      {isLoading ? <p>Carregando gravações...</p> : null}
                      {error ? <p className="form-error">{error}</p> : null}
                      {!isLoading && !error && recordings.length === 0 ? (
                        <p className="panel-empty">Nenhuma gravação sincronizada ainda.</p>
                      ) : null}
                      {!isLoading && !error && recordings.length > 0
                        ? recordings.map((recording) => (
                            <div key={recording.id} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 10 }}>
                              <strong>{recording.recordingName}</strong>
                              <p style={{ margin: '6px 0' }}>Status: {recording.estado ?? 'N/A'}</p>
                              <p style={{ margin: '6px 0' }}>Última sincronização: {new Date(recording.ultimaSincronizacao).toLocaleString('pt-BR')}</p>
                              {recording.url ? (
                                <a href={recording.url} target="_blank" rel="noreferrer">Abrir gravação</a>
                              ) : (
                                <span>URL de gravação indisponível.</span>
                              )}
                            </div>
                          ))
                        : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="panel stacked-panel">
      <div className="section-topbar">
        <div>
          <h3>Agenda</h3>
          <span>Visões semanal, mensal e criação de compromissos</span>
        </div>
        <div className="section-actions">
          <div className="segmented-control">
            {([
              { key: 'semanal', label: 'semanal' },
              { key: 'mensal', label: 'mensal' },
            ] as const).map((mode) => (
              <button
                key={mode.key}
                type="button"
                className={`segmented-control-button ${agendaViewMode === mode.key ? 'active' : ''}`}
                onClick={() => setAgendaViewMode(mode.key)}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <button type="button" className="button button--primary section-create-button" onClick={() => setShowAgendaCreatePanel(true)}>
            + Novo evento
          </button>
        </div>
      </div>

      {showAgendaCreatePanel ? (
        <section className="agenda-create-layout">
          <div>
            {agendaViewMode === 'semanal' ? (
              <section className="agenda-week-board agenda-week-board--gc">
                {weekDatesForAgenda.map((iso, index) => {
                  const items = getAgendaWeekItems(index);
                  const dayNum = Number(iso.slice(8, 10));
                  const dayLabel = CALENDAR_WEEKDAY_LABELS[index];

                  return (
                    <article key={iso} className={`agenda-week-column ${iso === selectedDate ? 'agenda-week-column--selected' : ''}`}>
                      <header className="agenda-week-column-header">
                        <button type="button" className="agenda-week-column-head-btn" onClick={() => setSelectedDate(iso)}>
                          <strong>{dayLabel} {dayNum}</strong>
                          <small>{loadingWeekAgenda ? 'Carregando…' : `${items.length} evento${items.length === 1 ? '' : 's'}`}</small>
                        </button>
                      </header>
                      <div className="agenda-week-column-list">
                        {items.length > 0 ? items.map((item) => (
                          <article key={`${iso}-${item.id}`} className="agenda-week-item-card">
                            <strong>{item.title}</strong>
                            <small>{item.company}</small>
                            <span>{item.time ? item.time.slice(0, 5) : ''}</span>
                          </article>
                        )) : <p className="panel-empty">Sem compromissos</p>}
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : (
              <section className="panel calendar-panel agenda-month-panel gc-calendar-panel">
                <div className="panel-header calendar-header">
                  <div>
                    <h3>Agenda mensal</h3>
                    <span>{formatMonthLabel(selectedMonth)}</span>
                  </div>
                  <div className="calendar-nav">
                    <button type="button" className="button button--text gc-calendar-today-btn" onClick={() => setSelectedDate(getTodayIso())}>
                      Hoje
                    </button>
                    <button type="button" className="icon-button" aria-label="Mês anterior" onClick={() => changeMonth('prev')}>◀</button>
                    <button type="button" className="icon-button" aria-label="Próximo mês" onClick={() => changeMonth('next')}>▶</button>
                  </div>
                </div>
                <CalendarGrid
                  placement="agenda"
                  calendarDays={calendarDays}
                  selectedDate={selectedDate}
                  selectedMonth={selectedMonth}
                  loadingCalendar={loadingCalendar}
                  calendarLoadError={calendarLoadError}
                  onSelectDate={setSelectedDate}
                />
                <section className="panel agenda-day-insight" aria-labelledby="agenda-day-insight-heading">
                  <div className="agenda-day-insight__head">
                    <div>
                      <h4 id="agenda-day-insight-heading" className="agenda-day-insight__title">Detalhe do dia</h4>
                      <p className="agenda-day-insight__date">{formatSelectedDayLong(selectedDate)}</p>
                    </div>
                    <span className="agenda-day-insight__badge">{loadingAgenda ? 'Carregando…' : `${filteredAgendaItems.length} compromisso(s)`}</span>
                  </div>
                  {filteredAgendaItems.length === 0 ? <p className="panel-empty">Nenhum compromisso neste dia.</p> : null}
                </section>
              </section>
            )}
            {renderMeetAutomationPanel()}
          </div>
          <div className="panel agenda-create-sidepanel">
            <div className="panel-header">
              <div>
                <h3>Criar novo evento</h3>
                <span>{selectedDate}</span>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowAgendaCreatePanel(false)}>←</button>
            </div>
            <form className="agenda-form" onSubmit={handleCreateMeeting}>
              <label>
                Nome do Evento
                <input type="text" value={formTitle} onChange={(event) => setFormTitle(event.target.value)} required />
              </label>
              <label>
                Empresa
                <select
                  value={formEmpresaId}
                  onChange={(e) => setFormEmpresaId(e.target.value)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border, #334155)', background: 'var(--color-bg, #0f172a)', color: 'inherit', fontSize: '13px', width: '100%' }}
                >
                  <option value="">Selecione...</option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>{e.razaoSocial}</option>
                  ))}
                </select>
              </label>
              <label>
                Categoria
                <input type="text" value={formPresencial ? 'Presencial' : 'Online'} readOnly />
              </label>
              <div className="agenda-form-row">
                <label>
                  Hora
                  <input type="time" value={formTime} onChange={(event) => setFormTime(event.target.value)} required />
                </label>
                <label className="agenda-checkbox">
                  <input type="checkbox" checked={formPresencial} onChange={(event) => setFormPresencial(event.target.checked)} />
                  Presencial
                </label>
              </div>
              {formPresencial ? (
                <label>
                  Sala
                  <input type="text" value={formLocation} onChange={(event) => setFormLocation(event.target.value)} required />
                </label>
              ) : (
                <label>
                  Link online
                  <input type="url" value={formLinkOnline} onChange={(event) => setFormLinkOnline(event.target.value)} required />
                </label>
              )}
              {formError ? <p className="form-error">{formError}</p> : null}
              <button type="submit" className="button button--primary" disabled={formSubmitting}>
                {formSubmitting ? 'Agendando...' : 'Salvar evento'}
              </button>
            </form>
          </div>
        </section>
      ) : agendaViewMode === 'semanal' ? (
        <>
          <section className="agenda-week-board agenda-week-board--gc">
            {weekDatesForAgenda.map((iso, index) => {
              const items = getAgendaWeekItems(index);
              const dayNum = Number(iso.slice(8, 10));
              const dayLabel = CALENDAR_WEEKDAY_LABELS[index];

              return (
                <article key={iso} className={`agenda-week-column ${iso === selectedDate ? 'agenda-week-column--selected' : ''}`}>
                  <header className="agenda-week-column-header">
                    <button type="button" className="agenda-week-column-head-btn" onClick={() => setSelectedDate(iso)}>
                      <strong>{dayLabel} {dayNum}</strong>
                      <small>{loadingWeekAgenda ? 'Carregando…' : `${items.length} evento${items.length === 1 ? '' : 's'}`}</small>
                    </button>
                  </header>
                  <div className="agenda-week-column-list">
                    {items.length > 0 ? items.map((item) => (
                      <article key={`${iso}-${item.id}`} className="agenda-week-item-card">
                        <strong>{item.title}</strong>
                        <small>{item.company}</small>
                        <span>{item.time ? item.time.slice(0, 5) : ''}</span>
                      </article>
                    )) : <p className="panel-empty">Sem compromissos</p>}
                  </div>
                </article>
              );
            })}
          </section>
          {renderMeetAutomationPanel()}
        </>
      ) : (
        <>
          <section className="panel calendar-panel agenda-month-panel gc-calendar-panel">
            <div className="panel-header calendar-header">
              <div>
                <h3>Agenda mensal</h3>
                <span>{formatMonthLabel(selectedMonth)}</span>
              </div>
              <div className="calendar-nav">
                <button type="button" className="button button--text gc-calendar-today-btn" onClick={() => setSelectedDate(getTodayIso())}>Hoje</button>
                <button type="button" className="icon-button" aria-label="Mês anterior" onClick={() => changeMonth('prev')}>◀</button>
                <button type="button" className="icon-button" aria-label="Próximo mês" onClick={() => changeMonth('next')}>▶</button>
              </div>
            </div>
            <CalendarGrid
              placement="agenda"
              calendarDays={calendarDays}
              selectedDate={selectedDate}
              selectedMonth={selectedMonth}
              loadingCalendar={loadingCalendar}
              calendarLoadError={calendarLoadError}
              onSelectDate={setSelectedDate}
            />
          </section>
          {renderMeetAutomationPanel()}
        </>
      )}
    </section>
  );
}
