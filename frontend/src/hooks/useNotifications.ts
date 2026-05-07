import { useMemo, useState } from 'react';
import type { NotificationFeedItem, ProposalColumn } from '../types';

type UseNotificationsParams = {
  filteredAgendaItemsCount: number;
  filteredUpcomingItemsCount: number;
  filteredProposalColumns: ProposalColumn[];
  notificationMessage: string;
  showNotifications: boolean;
};

const initialRecentNotifications: NotificationFeedItem[] = [
  {
    title: 'Sistema operacional pronto',
    description: 'Acompanhe agenda, propostas e operação central em tempo real.',
    tone: 'accent',
    channel: 'site',
    timeLabel: 'agora',
  },
];

export function useNotifications({
  filteredAgendaItemsCount,
  filteredUpcomingItemsCount,
  filteredProposalColumns,
  notificationMessage,
  showNotifications,
}: UseNotificationsParams) {
  const [recentNotifications, setRecentNotifications] = useState<NotificationFeedItem[]>(initialRecentNotifications);

  const notificationItems = useMemo(() => {
    const operationalItems: NotificationFeedItem[] = [
      {
        title: 'Agenda do dia',
        description:
          filteredAgendaItemsCount > 0
            ? `${filteredAgendaItemsCount} compromisso(s) relacionado(s) ao filtro atual.`
            : 'Nenhum compromisso encontrado para o filtro atual.',
        tone: 'accent',
        channel: 'site',
        timeLabel: 'agora',
      },
      {
        title: 'Prazos próximos',
        description:
          filteredUpcomingItemsCount > 0
            ? `${filteredUpcomingItemsCount} prazo(s) com atenção nos próximos dias.`
            : 'Nenhum prazo crítico encontrado.',
        tone: 'neutral',
        channel: 'site',
        timeLabel: 'agora',
      },
      {
        title: 'Operação comercial',
        description: `${filteredProposalColumns.reduce((total, column) => total + column.items.length, 0)} proposta(s) visíveis no quadro atual.`,
        tone: 'neutral',
        channel: 'site',
        timeLabel: 'agora',
      },
    ];

    const highlighted =
      showNotifications && notificationMessage
        ? [
            {
              title: 'Atualização recente',
              description: notificationMessage,
              tone: 'accent' as const,
              channel: 'site' as const,
              timeLabel: 'agora',
            },
          ]
        : [];

    return [...recentNotifications, ...highlighted, ...operationalItems].slice(0, 6);
  }, [
    filteredAgendaItemsCount,
    filteredProposalColumns,
    filteredUpcomingItemsCount,
    notificationMessage,
    recentNotifications,
    showNotifications,
  ]);

  function pushNotification(item: Omit<NotificationFeedItem, 'timeLabel'>) {
    setRecentNotifications((current) => [
      {
        ...item,
        timeLabel: 'agora',
      },
      ...current,
    ].slice(0, 8));
  }

  return { recentNotifications, notificationItems, pushNotification };
}
