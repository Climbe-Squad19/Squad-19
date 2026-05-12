/**
 * Cargos alinhados ao enum {@code Cargo} do backend (gestao-contratos).
 * Valores enviados à API devem ser os códigos em MAIÚSCULAS (ex.: MEMBRO_CONSELHO).
 */

/** Ordem usada em selects e chips (UX: direção → analistas). */
export const CARGO_ORDER = [
  'CEO',
  'CFO',
  'CMO',
  'CSO',
  'COMPLIANCE',
  'MEMBRO_CONSELHO',
  'ANALISTA_TRAINEE',
  'ANALISTA_JUNIOR',
  'ANALISTA_PLENO',
  'ANALISTA_SENIOR',
  'ANALISTA_BPO',
] as const;

const LABELS: Record<string, string> = {
  NENHUM: 'Não definido',
  CEO: 'CEO',
  COMPLIANCE: 'Compliance',
  MEMBRO_CONSELHO: 'Membro do Conselho',
  CSO: 'CSO',
  CMO: 'CMO',
  CFO: 'CFO',
  ANALISTA_TRAINEE: 'Analista Trainee',
  ANALISTA_JUNIOR: 'Analista Júnior',
  ANALISTA_PLENO: 'Analista Pleno',
  ANALISTA_SENIOR: 'Analista Sênior',
  ANALISTA_BPO: 'Analista BPO',
};

/** Normaliza resposta da API (string, enum Jackson, etc.) para código UPPER_SNAKE. */
export function normalizeCargoFromApi(raw: unknown): string {
  if (raw == null) {
    return 'NENHUM';
  }
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (s === '' || s === 'null' || s === 'undefined') {
      return 'NENHUM';
    }
    return s.toUpperCase().replace(/\s+/g, '_');
  }
  if (typeof raw === 'object' && raw !== null && 'name' in (raw as object)) {
    return normalizeCargoFromApi((raw as { name: unknown }).name);
  }
  return 'NENHUM';
}

/** Rótulo amigável para exibição (perfil, equipe, notificações). */
export function formatCargoDisplay(cargo: string | null | undefined): string {
  const key = normalizeCargoFromApi(cargo);
  if (LABELS[key]) {
    return LABELS[key];
  }
  return key
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

/** Opções para selects / modal de novo colaborador — value = código da API. */
export const TEAM_CARGO_OPTIONS: ReadonlyArray<{ value: string; label: string }> = CARGO_ORDER.map((value) => ({
  value,
  label: formatCargoDisplay(value),
}));
