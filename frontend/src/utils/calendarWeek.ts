/** YYYY-MM-DD a partir de Date local (sem UTC shift). */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Semana domingo → sábado que contém anchorIso. */
export function getSundayWeekDateStrings(anchorIso: string): string[] {
  const [y, mo, da] = anchorIso.split('-').map(Number);
  const d = new Date(y, mo - 1, da, 12, 0, 0, 0);
  const dow = d.getDay();
  d.setDate(d.getDate() - dow);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    out.push(formatLocalDate(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}
