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
    id: number;
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

type MeetRecordingItemApi = {
  nome: string | null;
  estado: string | null;
  arquivoDrive: string | null;
  url: string | null;
};

type MeetInsightsApiResponse = {
  meetingCode: string;
  participantes: number;
  duracaoMinutos: number | null;
  possuiGravacao: boolean;
  gravacoes: MeetRecordingItemApi[];
};

type PersistedMeetRecordingApi = {
  id: number;
  reuniaoId: number;
  meetingCode: string | null;
  recordingName: string;
  estado: string | null;
  driveFile: string | null;
  url: string | null;
  ultimaSincronizacao: string;
};

type SyncMeetRecordingsBulkApiResponse = {
  reunioesAtualizadas: number;
  diasRetroativos: number;
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

export async function fetchMeetingMeetInsights(reuniaoId: number): Promise<MeetInsightsApiResponse> {
  const response = await fetch(`${API_BASE_URL}/reunioes/${encodeURIComponent(String(reuniaoId))}/meet/insights`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar dados do Google Meet');
  }

  return response.json();
}

export async function syncMeetingRecordings(reuniaoId: number): Promise<PersistedMeetRecordingApi[]> {
  const response = await fetch(`${API_BASE_URL}/reunioes/${encodeURIComponent(String(reuniaoId))}/meet/sync-gravacoes`, {
    method: 'POST',
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao sincronizar gravações da reunião');
  }

  return response.json();
}

export async function fetchPersistedMeetingRecordings(reuniaoId: number): Promise<PersistedMeetRecordingApi[]> {
  const response = await fetch(`${API_BASE_URL}/reunioes/${encodeURIComponent(String(reuniaoId))}/meet/gravacoes`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar gravações sincronizadas');
  }

  return response.json();
}

export async function syncMeetingRecordingsBulk(diasRetroativos = 14): Promise<SyncMeetRecordingsBulkApiResponse> {
  const response = await fetch(`${API_BASE_URL}/reunioes/meet/sync-gravacoes?diasRetroativos=${encodeURIComponent(String(diasRetroativos))}`, {
    method: 'POST',
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao sincronizar gravações em lote');
  }

  return response.json();
}

export type {
  AgendaApiItem,
  CalendarApiDay,
  CalendarEventSnippet,
  CreateMeetingPayload,
  DashboardOverviewApiResponse,
  MeetRecordingItemApi,
  MeetInsightsApiResponse,
  PersistedMeetRecordingApi,
  SyncMeetRecordingsBulkApiResponse,
};
