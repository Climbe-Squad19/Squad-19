import { API_BASE_URL, buildAuthHeaders } from './api';

type AgendaApiItem = {
  id: number;
  title: string;
  company: string;
  time: string;
  location: string;
  status: string;
  presencial: boolean;
  linkOnline: string;
  dateTime: string;
};

type CalendarEventSnippet = {
  id: number;
  title: string;
  time: string;
};

type CalendarApiDay = {
  day: number;
  eventCount: number;
  hasEvents: boolean;
  /** Compromissos do dia (ordenados), para chips estilo Google Calendar */
  events?: CalendarEventSnippet[];
};

type CreateMeetingPayload = {
  pauta: string;
  empresaId: number;
  contratoId: number;
  dataHora: string;
  presencial: boolean;
  linkOnline: string;
  sala: string;
  participantesIds: number[];
};

type DashboardOverviewApiResponse = {
  propostasPendentes: number;
  contratosAtivos: number;
  documentosPendentes: number;
  reunioesSemana: number;
  ultimosContratos: Array<{
    empresa: string;
    servico: string;
    dataCriacao: string;
  }>;
  proximosVencimentos: Array<{
    empresa: string;
    referencia: string;
    dataVencimento: string;
  }>;
};

export async function fetchAgenda(date: string): Promise<AgendaApiItem[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/agenda?date=${encodeURIComponent(date)}`, {
    cache: 'no-store',
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar agenda');
  }

  return response.json();
}

export async function fetchCalendar(month: string): Promise<CalendarApiDay[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/calendar?month=${encodeURIComponent(month)}`, {
    cache: 'no-store',
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar calendário');
  }

  return response.json();
}

export async function createMeeting(payload: CreateMeetingPayload): Promise<AgendaApiItem> {
  const response = await fetch(`${API_BASE_URL}/reunioes`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar reunião');
  }

  return response.json();
}

export async function fetchDashboardOverview(): Promise<DashboardOverviewApiResponse> {
  const response = await fetch(`${API_BASE_URL}/dashboard/overview`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar resumo do dashboard');
  }

  return response.json();
}

export type { AgendaApiItem, CalendarApiDay, CalendarEventSnippet, CreateMeetingPayload, DashboardOverviewApiResponse };
