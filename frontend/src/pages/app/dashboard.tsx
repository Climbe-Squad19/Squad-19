import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { getTodayIso } from '../../utils/date';
import { useDashboardOverview } from '../../hooks/use-dashboard-overview';
import { CircleAlert, Eye, Link, Phone, ReceiptText, TriangleAlert } from 'lucide-react';
import { AgendaApiItem, fetchAgenda } from '../../services/dashboard';
import dayjs from 'dayjs';

type ExpandedSection = 'contracts' | 'dueDates' | null;

export default function DashboardPage() {
  const { search } = useOutletContext<{ search: string }>();
  const { summaryCards, recentContracts, upcomingItems } = useDashboardOverview();
  const [selectedDate, setSelectedDate] = useState(getTodayIso());
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);

  const [schedule, setSchedule] = useState<AgendaApiItem[]>([]);
  const [loadingAgenda, setLoadingAgenda] = useState(false);

  const searchTerm = search.trim().toLowerCase();

  useEffect(() => {
    let cancelled = false;
    setLoadingAgenda(true);

    fetchAgenda(selectedDate)
      .then(events => {
        ({ iso: selectedDate, events })
        if (cancelled) return;
        const schedule: AgendaApiItem[] = [];
        events.forEach(result => {
          schedule.push(result);
        });
        setSchedule(schedule);
      })
      .catch(() => {
        ({ iso: selectedDate, events: [] })
        if (!cancelled) setLoadingAgenda(false);
      })
  }, [selectedDate]);

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
          <div
            key={card.title}
            className="w-full bg-zinc-950 dark:bg-zinc-950 light:bg-white flex flex-col p-2 gap-2.5 rounded-md border border-zinc-500"
          >
            <div className="flex items-center gap-2">
              <CircleAlert className="size-4 stroke-1 text-zinc-100" />
              <span className="text-sm font-semibold">{card.title}</span>
            </div>

            <div className="bg-zinc-900 flex flex-col px-2 py-6 gap-2.5 rounded">
              <span className="text-lg font-semibold text-center mt-1.5">{card.value}</span>
              <p className="text-xs text-end text-zinc-500">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_295px] gap-3 px-4">
        <div className="w-full space-y-2">
          <div className="w-full bg-[#121214] border border-zinc-800/60 rounded-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60">
              <div className="flex gap-3 text-base font-semibold text-zinc-100 items-center">
                <ReceiptText className="size-5" />
                Últimos contratos gerados
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="px-6 py-4 text-sm font-medium text-zinc-400 w-1/3">Empresa</th>
                    <th className="px-6 py-4 text-sm font-medium text-zinc-400 w-1/3">Serviço</th>
                    <th className="px-6 py-4 text-sm font-medium text-zinc-400 w-1/3">Início do contrato</th>
                    <th className="px-6 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleContracts.length > 0 ? (
                    visibleContracts.map((contract) => (
                      <tr
                        key={`${contract.company}-${contract.start}`}
                        className="border-b border-zinc-800/60 last:border-0 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-zinc-200 font-medium">{contract.company}</td>
                        <td className="px-6 py-4 text-sm text-zinc-300">{contract.service}</td>
                        <td className="px-6 py-4 text-sm text-zinc-300">{contract.start}</td>
                        <td className="px-6 py-4 text-right">
                          <Tooltip title="Abrir contrato" arrow placement="top">
                            <button
                              type="button"
                              className="p-2 rounded-lg border border-zinc-700 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all focus:outline-none focus:ring-2 focus:ring-[#79C6C0]/50"
                            >
                              <Link className="size-4" />
                            </button>
                          </Tooltip>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-500">
                        Nenhum contrato encontrado para o filtro atual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="w-full bg-[#121214] border border-zinc-800/60 rounded-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60">
              <div className="flex gap-3 text-base font-semibold text-zinc-100 items-center">
                <TriangleAlert className="size-5" />
                Próximos vencimentos
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="px-6 py-4 text-sm font-medium text-zinc-400 w-1/4">Empresa</th>
                    <th className="px-6 py-4 text-sm font-medium text-zinc-400 w-1/4">Referência</th>
                    <th className="px-6 py-4 text-sm font-medium text-zinc-400 w-1/4">Vencimento</th>
                    <th className="px-6 py-4 text-sm font-medium text-zinc-400 w-1/4">Prioridade</th>
                    <th className="px-6 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDueDates.length > 0 ? (
                    visibleDueDates.map((item) => {
                      const priorityStyles = {
                        Alta: 'bg-red-300 text-red-800 border-red-800',
                        Média: 'bg-orange-200 text-orange-800 border-orange-800',
                        Baixa: 'bg-sky-200 text-sky-800 border-sky-800'
                      }[item.priority] || 'bg-zinc-200 text-zinc-800 border-zinc-800';

                      return (
                        <tr
                          key={`${item.client}-${item.reference}`}
                          className="border-b border-zinc-800/60 last:border-0 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-zinc-200 font-medium">{item.client}</td>
                          <td className="px-6 py-4 text-sm text-zinc-300">{item.reference}</td>
                          <td className="px-6 py-4 text-sm text-zinc-300">{item.due}</td>
                          <td className="px-6 py-4">
                            <div className={`text-xs font-semibold border px-3 py-1.5 rounded-md flex w-fit items-center justify-center ${priorityStyles}`}>
                              {item.priority}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Tooltip title="Ver detalhes" arrow placement="top">
                              <button
                                type="button"
                                disabled
                                className="p-2 rounded-lg border border-zinc-700 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all focus:outline-none focus:ring-2 focus:ring-[#79C6C0]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Eye className="size-4" />
                              </button>
                            </Tooltip>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                        Nenhum vencimento encontrado para o filtro atual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <div className='w-full bg-zinc-900 flex flex-col px-3 py-2 rounded-md border border-zinc-800'>
          <h3 className='text-base font-semibold flex pb-2'>Agenda do dia</h3>

          <div className='space-y-2 max-h-80'>
            {schedule.map(item => {
              const formattedDate = dayjs(item.dateTime).format('HH:mm')
              return (
                <div key={item.id} className='flex gap-2 items-center pt-2 border-t border-zinc-800/60'>
                  <div className='bg-zinc-800 rounded-full size-7 flex items-center justify-center'>
                    <Phone className='size-4' />
                  </div>
                  <div>
                    <span className='text-sm font-semibold'>{item.title}</span>
                    <p className='text-xs font-medium text-zinc-500'>{formattedDate}h - {item.presencial ? 'Presencial' : 'Online'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  );
}