export type SummaryCard = {
  title: string;
  value: string;
  subtitle: string;
};

export type NotificationFeedItem = {
  title: string;
  description: string;
  tone: 'accent' | 'neutral';
  channel: 'site' | 'email' | 'calendar';
  timeLabel: string;
};

export type EntityActionModal = {
  title: string;
  subtitle: string;
  actionLabel: string;
  actionIcon: string;
  variant?: 'default' | 'download';
  details: Array<{ label: string; value: string }>;
  fileName?: string;
  fileContent?: string;
};
