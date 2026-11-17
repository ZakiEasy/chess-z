const pad = (n) => String(n).padStart(2, '0');

// Date locale du navigateur au format AAAA-MM-JJ (offsetDays : -1 = hier)
export function localDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Série affichée : à 0 si le dernier jour joué n'est ni aujourd'hui ni hier
export function currentStreak(child) {
  const last = child.last_active_on;
  return last === localDate() || last === localDate(-1) ? child.streak : 0;
}

function parse(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export const shortDay = (iso) => parse(iso).toLocaleDateString('fr-FR', { weekday: 'short' });
export const longDay = (iso) => parse(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
